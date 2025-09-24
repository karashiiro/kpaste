import type {
  AuthStateData,
  AuthSession,
  AuthStateChangeListener,
  AuthManagerConfig,
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

export interface OAuthLoginRequest {
  handle: string;
}

export class OAuthAuthManager {
  private state: AuthStateData;
  private listeners: Set<AuthStateChangeListener> = new Set();
  private config: AuthManagerConfig;
  private client: Client | null = null;
  private agent: OAuthUserAgent | null = null;

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

    // Configure OAuth
    this.initializeOAuth();
    this.loadPersistedSession();
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
      sessionStorage.setItem("oauth_handle", request.handle);

      // Redirect to authorization server
      window.location.assign(authUrl);
    } catch (error) {
      this.setState({
        state: "error",
        error: this.formatError(error),
        isLoading: false,
      });
    }
  }

  public async handleOAuthCallback(params: URLSearchParams): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Finalize the authorization
      const session: Session = await finalizeAuthorization(params);

      // Create OAuth user agent and Client
      this.agent = new OAuthUserAgent(session);
      this.client = new Client({ handler: this.agent });

      // Get handle from session storage
      const handle = sessionStorage.getItem("oauth_handle") || "unknown";
      sessionStorage.removeItem("oauth_handle");

      // Convert to our auth session format
      const authSession: AuthSession = {
        did: session.info.sub,
        handle: handle,
        accessJwt: session.token.access,
        refreshJwt: session.token.refresh || "",
        active: true,
        endpoint: {
          url: session.info.aud,
          name: new URL(session.info.aud).hostname,
        },
        createdAt: new Date(),
        expiresAt: session.token.expires_at
          ? new Date(session.token.expires_at * 1000)
          : undefined,
        profile: {
          did: session.info.sub,
          handle: handle,
          displayName: undefined,
          avatar: undefined,
          description: undefined,
        },
      };

      this.setState({
        state: "authenticated",
        session: authSession,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        state: "error",
        error: this.formatError(error),
        isLoading: false,
      });
    }
  }

  public async logout(): Promise<void> {
    this.setState({ isLoading: true });

    try {
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

  private async loadPersistedSession(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const session: AuthSession = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };

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

  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(this.config.storageKey!);
    } catch (error) {
      console.warn("Failed to clear persisted session:", error);
    }
  }

  private formatError(error: unknown): { code: string; message: string } {
    if (error instanceof Error) {
      return {
        code: "OAUTH_ERROR",
        message: error.message,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    };
  }
}
