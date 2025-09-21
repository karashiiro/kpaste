import type {
  AuthStateData,
  AuthSession,
  LoginCredentials,
  TwoFactorVerification,
  AuthError,
  ServiceEndpoint,
  AtProtoClient,
  AuthStateChangeListener,
  AuthManagerConfig,
} from "./types";
import { CredentialManager, Client, ClientResponseError } from "@atcute/client";
import type { AtpSessionData } from "@atcute/client";

export class AtProtoAuthManager {
  private state: AuthStateData;
  private listeners: Set<AuthStateChangeListener> = new Set();
  private config: AuthManagerConfig;
  private credentialManager: CredentialManager | null = null;
  private client: AtProtoClient | null = null;
  private pendingCredentials: LoginCredentials | null = null;

  constructor(config: AuthManagerConfig = {}) {
    this.config = {
      storageKey: "atproto_auth_session",
      autoRefresh: true,
      refreshThreshold: 300000, // 5 minutes
      ...config,
    };

    this.state = {
      state: "unauthenticated",
      isLoading: false,
    };

    this.loadPersistedSession();
  }

  public getState(): AuthStateData {
    return { ...this.state };
  }

  public getClient(): AtProtoClient | null {
    return this.client;
  }

  public addListener(listener: AuthStateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: Partial<AuthStateData>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();

    if (this.state.session) {
      this.persistSession(this.state.session);
    } else {
      this.clearPersistedSession();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  private createCredentialManager(serviceUrl: string): CredentialManager {
    return new CredentialManager({
      service: serviceUrl,
      onSessionUpdate: (session: AtpSessionData) => {
        const authSession = this.convertAtpSessionToAuthSession(session, {
          url: serviceUrl,
        });
        this.setState({
          state: "authenticated",
          session: authSession,
          isLoading: false,
        });
      },
      onExpired: (session: AtpSessionData) => {
        console.warn("Session expired:", session);
        this.setState({
          state: "error",
          error: {
            code: "SESSION_EXPIRED",
            message: "Session has expired",
          },
          session: undefined,
          isLoading: false,
        });
      },
      onRefresh: (session: AtpSessionData) => {
        const authSession = this.convertAtpSessionToAuthSession(session, {
          url: serviceUrl,
        });
        this.setState({
          session: authSession,
        });
      },
    });
  }

  private convertAtpSessionToAuthSession(
    atpSession: AtpSessionData,
    endpoint: ServiceEndpoint,
  ): AuthSession {
    return {
      ...atpSession,
      endpoint,
      createdAt: new Date(),
      expiresAt: undefined, // AtpSessionData doesn't include expiry info directly
      profile: {
        did: atpSession.did,
        handle: atpSession.handle,
        displayName: undefined,
        avatar: undefined,
        description: undefined,
      },
    };
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    this.setState({
      state: "authenticating",
      isLoading: true,
      error: undefined,
    });

    try {
      // Create credential manager for the specified service
      this.credentialManager = this.createCredentialManager(
        credentials.endpoint.url,
      );
      this.client = new Client({ handler: this.credentialManager });

      // Attempt login
      const session = await this.credentialManager.login({
        identifier: credentials.identifier,
        password: credentials.password,
        code: credentials.twoFactorCode,
      });

      // Convert and store session
      const authSession = this.convertAtpSessionToAuthSession(
        session,
        credentials.endpoint,
      );

      this.setState({
        state: "authenticated",
        session: authSession,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login failed:", error);

      // Handle 2FA requirement
      if (
        error instanceof ClientResponseError &&
        error.error === "AuthFactorTokenRequired"
      ) {
        // Store credentials for 2FA retry
        this.pendingCredentials = credentials;

        this.setState({
          state: "requires2fa",
          twoFactorChallenge: {
            challengeId: "email-totp-" + Date.now(),
            method: "totp",
            destination: credentials.identifier,
            expiresAt: new Date(Date.now() + 300000), // 5 minutes
          },
          isLoading: false,
        });
        return;
      }

      // Clear pending credentials on error
      this.pendingCredentials = null;

      this.setState({
        state: "error",
        error: this.formatError(error),
        isLoading: false,
      });
    }
  }

  public async verifyTwoFactor(
    verification: TwoFactorVerification,
  ): Promise<void> {
    if (
      this.state.state !== "requires2fa" ||
      !this.credentialManager ||
      !this.pendingCredentials
    ) {
      throw new Error("No 2FA challenge in progress or missing credentials");
    }

    this.setState({ isLoading: true });

    try {
      // Retry login with the stored credentials + 2FA code
      const session = await this.credentialManager.login({
        identifier: this.pendingCredentials.identifier,
        password: this.pendingCredentials.password,
        code: verification.code,
      });

      // Convert and store session
      const authSession = this.convertAtpSessionToAuthSession(
        session,
        this.pendingCredentials.endpoint,
      );

      // Clear pending credentials
      this.pendingCredentials = null;

      this.setState({
        state: "authenticated",
        session: authSession,
        twoFactorChallenge: undefined,
        isLoading: false,
      });
    } catch (error) {
      console.error("2FA verification failed:", error);

      this.setState({
        error: this.formatError(error),
        isLoading: false,
      });
    }
  }

  public async logout(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Clear client and credential manager
      this.client = null;
      this.credentialManager = null;
      this.pendingCredentials = null;

      this.setState({
        state: "unauthenticated",
        session: undefined,
        error: undefined,
        twoFactorChallenge: undefined,
        isLoading: false,
      });
    } catch {
      // Even if logout fails, clear local state
      this.client = null;
      this.credentialManager = null;
      this.pendingCredentials = null;

      this.setState({
        state: "unauthenticated",
        session: undefined,
        error: undefined,
        twoFactorChallenge: undefined,
        isLoading: false,
      });
    }
  }

  public async refreshSession(): Promise<void> {
    if (!this.state.session?.refreshJwt || !this.credentialManager) {
      throw new Error("No refresh token or credential manager available");
    }

    this.setState({ isLoading: true });

    try {
      // The credential manager handles refresh automatically via onRefresh callback
      // We just need to make a test request to trigger it if needed
      await this.credentialManager.resume(this.state.session);

      this.setState({
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        state: "error",
        error: this.formatError(error),
        session: undefined,
        isLoading: false,
      });
    }
  }

  public async validateServiceEndpoint(
    endpoint: ServiceEndpoint,
  ): Promise<boolean> {
    try {
      // Create a temporary credential manager to test the endpoint
      const tempManager = new CredentialManager({
        service: endpoint.url,
      });

      const tempClient = new Client({ handler: tempManager });

      // Try to describe the server to validate it's a valid AtProto service
      const response = await tempClient.get(
        "com.atproto.server.describeServer",
        {},
      );

      return response.ok;
    } catch (error) {
      console.warn("Endpoint validation failed:", error);
      return false;
    }
  }

  private formatError(error: unknown): AuthError {
    if (error instanceof ClientResponseError) {
      return {
        code: error.error,
        message: error.description || error.message,
        details: {
          status: error.status,
          headers: Object.fromEntries(error.headers.entries()),
        },
      };
    }

    if (error instanceof Error) {
      return {
        code: "AUTH_ERROR",
        message: error.message,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    };
  }

  private persistSession(session: AuthSession): void {
    try {
      const serializedSession = JSON.stringify({
        ...session,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt?.toISOString(),
      });
      localStorage.setItem(this.config.storageKey!, serializedSession);
    } catch (error) {
      console.warn("Failed to persist session:", error);
    }
  }

  private loadPersistedSession(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const session: AuthSession = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };

      // Check if session is expired (if we have expiry info)
      if (session.expiresAt && session.expiresAt < new Date()) {
        this.clearPersistedSession();
        return;
      }

      // Create credential manager and client for the persisted session
      this.credentialManager = this.createCredentialManager(
        session.endpoint.url,
      );
      this.client = new Client({ handler: this.credentialManager });

      // Resume session with credential manager
      this.credentialManager
        .resume(session)
        .then((resumedSession) => {
          const authSession = this.convertAtpSessionToAuthSession(
            resumedSession,
            session.endpoint,
          );
          this.setState({
            state: "authenticated",
            session: authSession,
          });
        })
        .catch((error) => {
          console.warn("Failed to resume session:", error);
          this.clearPersistedSession();
        });
    } catch (error) {
      console.warn("Failed to load persisted session:", error);
      this.clearPersistedSession();
    }
  }

  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(this.config.storageKey!);
    } catch (error) {
      console.warn("Failed to clear persisted session:", error);
    }
  }
}
