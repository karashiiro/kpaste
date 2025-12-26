import type {
  AuthStateData,
  AuthSession,
  AuthStateChangeListener,
  AuthManagerConfig,
  AuthError,
} from "./types";
import {
  configureOAuth,
  resolveFromIdentity,
  createAuthorizationUrl,
  finalizeAuthorization,
  getSession,
  deleteStoredSession,
  OAuthUserAgent,
} from "@atcute/oauth-browser-client";
import type { Session } from "@atcute/oauth-browser-client";
import { Client } from "@atcute/client";

type TimerHandle = ReturnType<typeof setInterval>;

export interface OAuthLoginRequest {
  handle: string;
}

export class OAuthAuthManager {
  private state: AuthStateData;
  private listeners: Set<AuthStateChangeListener> = new Set();
  private config: Required<AuthManagerConfig>;
  private client: Client | null = null;
  private agent: OAuthUserAgent | null = null;
  private initialized = false;
  private refreshTimer: TimerHandle | null = null;

  // Constants for storage keys
  private readonly OAUTH_HANDLE_KEY = "oauth_handle";

  constructor(config: AuthManagerConfig = {}) {
    this.config = {
      storageKey: "atproto_oauth_session",
      autoRefresh: true,
      refreshThreshold: 300000, // 5 minutes
      ...config,
    };

    this.state = {
      state: "unauthenticated",
      isLoading: false,
    };

    this.initializeOAuth();
  }

  /**
   * Initialize the auth manager and load any persisted session.
   * Must be called before using any other methods.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.loadPersistedSession();
    this.initialized = true;

    // Start auto-refresh if enabled
    if (this.config.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  private initializeOAuth() {
    configureOAuth({
      metadata: {
        client_id:
          import.meta.env.VITE_OAUTH_CLIENT_ID ||
          `${window.location.origin}/oauth-client-metadata.json`,
        redirect_uri:
          import.meta.env.VITE_OAUTH_REDIRECT_URI ||
          `${window.location.origin}/oauth/callback`,
      },
    });
  }

  public getState(): AuthStateData {
    return { ...this.state };
  }

  public getClient(): Client | null {
    return this.client;
  }

  public getAgent(): OAuthUserAgent | null {
    return this.agent;
  }

  public addListener(listener: AuthStateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: Partial<AuthStateData>): void {
    this.state = { ...this.state, ...newState };

    // Persist first (critical operation)
    if (this.state.session) {
      this.persistSession(this.state.session);
    } else {
      this.clearPersistedSession();
    }

    // Notify listeners last (non-critical, isolated)
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const state = this.getState(); // Clone once
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("Listener error:", error);
        // Continue notifying other listeners
      }
    });
  }

  private handleError(error: unknown): void {
    this.setState({
      state: "error",
      error: this.formatError(error),
      isLoading: false,
    });
  }

  /**
   * Initiates the OAuth login flow for a given user handle.
   *
   * This method will redirect the user to the OAuth authorization server.
   * After authorization, the user will be redirected back to the configured
   * redirect URI where handleOAuthCallback() should be called.
   *
   * @param request - The login request containing the user's handle
   * @throws {Error} If handle resolution fails or authorization URL cannot be created
   */
  public async startLogin(request: OAuthLoginRequest): Promise<void> {
    this.setState({
      state: "authenticating",
      isLoading: true,
      error: undefined,
    });

    try {
      // Resolve identity and service metadata
      const { metadata, identity } = await resolveFromIdentity(request.handle);

      // Create authorization URL
      const authUrl = await createAuthorizationUrl({
        metadata: metadata,
        identity: identity,
        scope: import.meta.env.VITE_OAUTH_SCOPE || "atproto transition:generic",
      });

      // Store handle for after redirect
      sessionStorage.setItem(this.OAUTH_HANDLE_KEY, request.handle);

      // Redirect to authorization server
      window.location.assign(authUrl);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Completes the OAuth flow after the user is redirected back from the
   * authorization server.
   *
   * @param params - URLSearchParams from the callback URL (contains code and state)
   * @throws {Error} If authorization cannot be finalized or token exchange fails
   */
  public async handleOAuthCallback(params: URLSearchParams): Promise<void> {
    this.setState({ isLoading: true });

    try {
      const oauthSession = await finalizeAuthorization(params);
      const handle = this.retrieveStoredHandle();

      this.initializeClientFromSession(oauthSession);
      const authSession = this.convertToAuthSession(oauthSession, handle);

      this.setState({
        state: "authenticated",
        session: authSession,
        isLoading: false,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private retrieveStoredHandle(): string {
    const handle = sessionStorage.getItem(this.OAUTH_HANDLE_KEY) || "unknown";
    sessionStorage.removeItem(this.OAUTH_HANDLE_KEY);
    return handle;
  }

  private initializeClientFromSession(session: Session): void {
    this.agent = new OAuthUserAgent(session);
    this.client = new Client({ handler: this.agent });
  }

  private parseEndpointName(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url; // Fallback to original if parsing fails
    }
  }

  private convertToAuthSession(session: Session, handle: string): AuthSession {
    return {
      did: session.info.sub,
      handle: handle,
      accessJwt: session.token.access,
      refreshJwt: session.token.refresh || "",
      active: true,
      endpoint: {
        url: session.info.aud,
        name: this.parseEndpointName(session.info.aud),
      },
      createdAt: new Date(),
      expiresAt: session.token.expires_at
        ? new Date(session.token.expires_at * 1000)
        : undefined,
      profile: {
        did: session.info.sub,
        handle: handle,
      },
    };
  }

  public async logout(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Stop auto-refresh timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }

      if (this.state.session?.did) {
        deleteStoredSession(this.state.session.did);
      }

      this.client = null;
      this.agent = null;

      this.setState({
        state: "unauthenticated",
        session: undefined,
        error: undefined,
        isLoading: false,
      });
    } catch (error) {
      console.warn("Logout cleanup failed:", error);
      // Even if cleanup fails, clear local state
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
      this.client = null;
      this.agent = null;

      this.setState({
        state: "unauthenticated",
        session: undefined,
        error: undefined,
        isLoading: false,
      });
    }
  }

  private startAutoRefresh(): void {
    const checkInterval = 60000; // Check every minute
    this.refreshTimer = setInterval(() => {
      if (this.state.session?.expiresAt) {
        const msUntilExpiry =
          this.state.session.expiresAt.getTime() - Date.now();
        if (msUntilExpiry < this.config.refreshThreshold) {
          this.refreshSession();
        }
      }
    }, checkInterval);
  }

  private async refreshSession(): Promise<void> {
    try {
      if (!this.state.session?.did) return;

      // Get the refreshed OAuth session
      const oauthSession = await getSession(this.state.session.did, {
        allowStale: false,
      });

      if (oauthSession) {
        // Update agent and client with new session
        this.agent = new OAuthUserAgent(oauthSession);
        this.client = new Client({ handler: this.agent });

        // Update session with new tokens
        const updatedSession: AuthSession = {
          ...this.state.session,
          accessJwt: oauthSession.token.access,
          refreshJwt: oauthSession.token.refresh || "",
          expiresAt: oauthSession.token.expires_at
            ? new Date(oauthSession.token.expires_at * 1000)
            : undefined,
        };

        this.setState({
          session: updatedSession,
        });
      } else {
        // Session cannot be refreshed, log out
        console.warn("Session refresh failed, logging out");
        await this.logout();
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      await this.logout();
    }
  }

  private async loadPersistedSession(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const session: AuthSession = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };

      // Check if token is expired before attempting to resume
      if (session.expiresAt && session.expiresAt < new Date()) {
        console.log("Persisted session has expired, clearing");
        this.clearPersistedSession();
        // Also delete from OAuth client storage
        if (session.did) {
          deleteStoredSession(session.did);
        }
        return;
      }

      // Try to resume OAuth session
      const oauthSession = await getSession(session.did, { allowStale: true });

      if (oauthSession) {
        this.agent = new OAuthUserAgent(oauthSession);
        this.client = new Client({ handler: this.agent });

        this.setState({
          state: "authenticated",
          session: session,
        });
      } else {
        this.clearPersistedSession();
      }
    } catch (error) {
      console.warn("Failed to load persisted session:", error);
      this.clearPersistedSession();
    }
  }

  /**
   * SECURITY NOTE: Tokens are stored in localStorage for persistence.
   * This makes them vulnerable to XSS attacks. Ensure:
   * 1. All dependencies are regularly audited
   * 2. CSP headers are properly configured
   * 3. Input sanitization is enforced throughout the app
   */
  private persistSession(session: AuthSession): void {
    try {
      const serializedSession = JSON.stringify({
        ...session,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt?.toISOString(),
      });
      localStorage.setItem(this.config.storageKey, serializedSession);
    } catch (error) {
      console.warn("Failed to persist session:", error);
    }
  }

  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.warn("Failed to clear persisted session:", error);
    }
  }

  private formatError(error: unknown): AuthError {
    if (error instanceof Error) {
      // Check for OAuth-specific errors
      const errorObj = error as Error & {
        error?: string;
        error_description?: string;
      };
      const oauthError = errorObj.error;
      const oauthDescription = errorObj.error_description;

      return {
        code: oauthError || "OAUTH_ERROR",
        message: oauthDescription || error.message,
        details: {
          stack: error.stack,
          name: error.name,
          // Preserve original error for debugging
          originalError: error,
        },
      };
    }

    // Handle string errors
    if (typeof error === "string") {
      return {
        code: "OAUTH_ERROR",
        message: error,
        details: undefined,
      };
    }

    // Handle completely unknown errors
    return {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
      details: { originalError: error },
    };
  }
}
