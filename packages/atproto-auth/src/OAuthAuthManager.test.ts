/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OAuthAuthManager } from "./OAuthAuthManager";
import type { AuthStateData } from "./types";

// Mock all OAuth dependencies with simpler approach
vi.mock("@atcute/oauth-browser-client", () => ({
  configureOAuth: vi.fn(),
  resolveFromIdentity: vi.fn(),
  createAuthorizationUrl: vi.fn(),
  finalizeAuthorization: vi.fn(),
  getSession: vi.fn(),
  deleteStoredSession: vi.fn(),
  OAuthUserAgent: vi.fn().mockImplementation(() => ({ type: "mock-agent" })),
}));

vi.mock("@atcute/client", () => ({
  Client: vi.fn().mockImplementation(() => ({ type: "mock-client" })),
}));

// Mock window and storage
const mockWindow = {
  location: {
    origin: "http://localhost:5173",
    assign: vi.fn(),
  },
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, "window", { value: mockWindow, writable: true });
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});
Object.defineProperty(global, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

describe("OAuthAuthManager", () => {
  let authManager: OAuthAuthManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);

    // Mock env vars
    vi.stubEnv("VITE_OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv(
      "VITE_OAUTH_REDIRECT_URI",
      "http://localhost:5173/oauth/callback",
    );
    vi.stubEnv("VITE_OAUTH_SCOPE", "atproto transition:generic");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe("initialization", () => {
    it("should initialize with unauthenticated state", () => {
      authManager = new OAuthAuthManager();

      const state = authManager.getState();
      expect(state).toEqual({
        state: "unauthenticated",
        isLoading: false,
      });
    });

    it("should accept custom configuration", () => {
      const customConfig = {
        storageKey: "custom-key",
        autoRefresh: false,
        refreshThreshold: 600000,
      };

      authManager = new OAuthAuthManager(customConfig);

      const state = authManager.getState();
      expect(state.state).toBe("unauthenticated");
      expect(state.isLoading).toBe(false);
    });

    it("should return client and agent as null initially", () => {
      authManager = new OAuthAuthManager();

      expect(authManager.getClient()).toBeNull();
      expect(authManager.getAgent()).toBeNull();
    });
  });

  describe("state management", () => {
    beforeEach(async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();
    });

    it("should add and remove listeners correctly", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = authManager.addListener(listener1);
      const unsubscribe2 = authManager.addListener(listener2);

      // Manually trigger state change to test listeners
      (authManager as any).setState({
        state: "authenticating",
        isLoading: true,
      });

      expect(listener1).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "authenticating",
          isLoading: true,
        }),
      );
      expect(listener2).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "authenticating",
          isLoading: true,
        }),
      );

      // Unsubscribe one listener
      unsubscribe1();
      vi.clearAllMocks();

      // Trigger another state change
      (authManager as any).setState({ state: "error", isLoading: false });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "error",
          isLoading: false,
        }),
      );

      unsubscribe2();
    });

    it("should return immutable state copies", () => {
      const state1 = authManager.getState();
      const state2 = authManager.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });

    it("should notify listeners when state changes", () => {
      const listener = vi.fn();
      authManager.addListener(listener);

      const newState: Partial<AuthStateData> = {
        state: "authenticating",
        isLoading: true,
      };

      (authManager as any).setState(newState);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining(newState));
    });
  });

  describe("login process", () => {
    beforeEach(async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();
    });

    it("should set authenticating state when starting login", async () => {
      const { resolveFromIdentity, createAuthorizationUrl } = await import(
        "@atcute/oauth-browser-client"
      );

      (resolveFromIdentity as any).mockResolvedValue({
        metadata: { issuer: "https://bsky.social" },
        identity: { did: "did:plc:test123" },
      });
      (createAuthorizationUrl as any).mockResolvedValue(
        "https://bsky.social/oauth/authorize",
      );

      const listener = vi.fn();
      authManager.addListener(listener);

      await authManager.startLogin({ handle: "test.bsky.social" });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "authenticating",
          isLoading: true,
        }),
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "oauth_handle",
        "test.bsky.social",
      );
      expect(mockWindow.location.assign).toHaveBeenCalledWith(
        "https://bsky.social/oauth/authorize",
      );
    });

    it("should handle login errors", async () => {
      const { resolveFromIdentity } = await import(
        "@atcute/oauth-browser-client"
      );
      const error = new Error("Failed to resolve identity");
      (resolveFromIdentity as any).mockRejectedValue(error);

      await authManager.startLogin({ handle: "invalid.handle" });

      const state = authManager.getState();
      expect(state.state).toBe("error");
      expect(state.error).toMatchObject({
        code: "OAUTH_ERROR",
        message: "Failed to resolve identity",
      });
      expect(state.error?.details).toBeDefined();
      expect(state.isLoading).toBe(false);
    });

    it("should handle unknown error types", async () => {
      const { resolveFromIdentity } = await import(
        "@atcute/oauth-browser-client"
      );
      (resolveFromIdentity as any).mockRejectedValue("string error");

      await authManager.startLogin({ handle: "test.bsky.social" });

      const state = authManager.getState();
      expect(state.state).toBe("error");
      // String errors are now handled as OAUTH_ERROR with the string as message
      expect(state.error).toMatchObject({
        code: "OAUTH_ERROR",
        message: "string error",
      });
    });
  });

  describe("OAuth callback handling", () => {
    beforeEach(async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();
    });

    it("should successfully handle OAuth callback", async () => {
      const { finalizeAuthorization } = await import(
        "@atcute/oauth-browser-client"
      );

      const mockOAuthSession = {
        info: {
          sub: "did:plc:test123",
          aud: "https://bsky.social",
        },
        token: {
          access: "access-token",
          refresh: "refresh-token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      };

      (finalizeAuthorization as any).mockResolvedValue(mockOAuthSession);
      mockSessionStorage.getItem.mockReturnValue("test.bsky.social");

      const params = new URLSearchParams("code=auth_code&state=random_state");
      await authManager.handleOAuthCallback(params);

      const state = authManager.getState();
      expect(state.state).toBe("authenticated");
      expect(state.session).toEqual(
        expect.objectContaining({
          did: "did:plc:test123",
          handle: "test.bsky.social",
          accessJwt: "access-token",
          refreshJwt: "refresh-token",
          active: true,
        }),
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "oauth_handle",
      );
    });

    it("should handle missing handle gracefully", async () => {
      const { finalizeAuthorization } = await import(
        "@atcute/oauth-browser-client"
      );

      (finalizeAuthorization as any).mockResolvedValue({
        info: { sub: "did:plc:test123", aud: "https://bsky.social" },
        token: { access: "token", refresh: "refresh" },
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      const params = new URLSearchParams("code=test");
      await authManager.handleOAuthCallback(params);

      const state = authManager.getState();
      expect(state.session?.handle).toBe("unknown");
    });

    it("should handle OAuth callback errors", async () => {
      const { finalizeAuthorization } = await import(
        "@atcute/oauth-browser-client"
      );
      const error = new Error("Invalid authorization code");
      (finalizeAuthorization as any).mockRejectedValue(error);

      const params = new URLSearchParams("code=invalid");
      await authManager.handleOAuthCallback(params);

      const state = authManager.getState();
      expect(state.state).toBe("error");
      expect(state.error).toMatchObject({
        code: "OAUTH_ERROR",
        message: "Invalid authorization code",
      });
      expect(state.error?.details).toBeDefined();
    });
  });

  describe("logout", () => {
    beforeEach(async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();
    });

    it("should clear state on logout", async () => {
      // Manually set authenticated state
      (authManager as any).setState({
        state: "authenticated",
        session: {
          did: "did:plc:test123",
          handle: "test.bsky.social",
          accessJwt: "token",
          refreshJwt: "refresh",
          active: true,
          endpoint: { url: "https://bsky.social", name: "bsky.social" },
          createdAt: new Date(),
          profile: { did: "did:plc:test123", handle: "test.bsky.social" },
        },
      });

      await authManager.logout();

      const state = authManager.getState();
      expect(state.state).toBe("unauthenticated");
      expect(state.session).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(authManager.getClient()).toBeNull();
      expect(authManager.getAgent()).toBeNull();
    });

    it("should handle logout without session gracefully", async () => {
      // Test logout when there's no session
      await authManager.logout();

      const state = authManager.getState();
      expect(state.state).toBe("unauthenticated");
      expect(state.session).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("session persistence", () => {
    it("should persist session data after authentication", async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();

      const { finalizeAuthorization } = await import(
        "@atcute/oauth-browser-client"
      );

      (finalizeAuthorization as any).mockResolvedValue({
        info: { sub: "did:plc:test123", aud: "https://bsky.social" },
        token: {
          access: "token",
          refresh: "refresh",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      });
      mockSessionStorage.getItem.mockReturnValue("test.bsky.social");

      await authManager.handleOAuthCallback(new URLSearchParams("code=test"));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "atproto_oauth_session",
        expect.stringContaining("did:plc:test123"),
      );
    });

    it("should handle persistence errors gracefully", async () => {
      authManager = new OAuthAuthManager();

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Trigger session persistence
      (authManager as any).setState({
        state: "authenticated",
        session: { did: "did:plc:test123" },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to persist session:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should load persisted session on initialization", async () => {
      const sessionData = {
        did: "did:plc:test123",
        handle: "test.bsky.social",
        accessJwt: "token",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date().toISOString(),
        profile: { did: "did:plc:test123", handle: "test.bsky.social" },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

      const { getSession } = await import("@atcute/oauth-browser-client");
      (getSession as any).mockResolvedValue({
        info: { sub: "did:plc:test123" },
        token: { access: "token" },
      });

      authManager = new OAuthAuthManager();
      await authManager.initialize();

      const state = authManager.getState();
      expect(state.state).toBe("authenticated");
      expect(state.session?.did).toBe("did:plc:test123");
    });

    it("should clear invalid persisted sessions", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      authManager = new OAuthAuthManager();
      await authManager.initialize();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "atproto_oauth_session",
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should clear persisted session if token is expired", async () => {
      const expiredSession = {
        did: "did:plc:test123",
        handle: "test.bsky.social",
        accessJwt: "token",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
        profile: { did: "did:plc:test123", handle: "test.bsky.social" },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { deleteStoredSession } = await import("@atcute/oauth-browser-client");

      authManager = new OAuthAuthManager();
      await authManager.initialize();

      const state = authManager.getState();
      expect(state.state).toBe("unauthenticated");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "atproto_oauth_session",
      );
      expect(deleteStoredSession).toHaveBeenCalledWith("did:plc:test123");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Persisted session has expired, clearing",
      );

      consoleLogSpy.mockRestore();
    });

    it("should load persisted session with future expiresAt", async () => {
      const validSession = {
        did: "did:plc:test123",
        handle: "test.bsky.social",
        accessJwt: "token",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // Expires in 1 hour
        profile: { did: "did:plc:test123", handle: "test.bsky.social" },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validSession));

      const { getSession } = await import("@atcute/oauth-browser-client");
      (getSession as any).mockResolvedValue({
        info: { sub: "did:plc:test123" },
        token: { access: "token" },
      });

      authManager = new OAuthAuthManager();
      await authManager.initialize();

      const state = authManager.getState();
      expect(state.state).toBe("authenticated");
      expect(state.session?.did).toBe("did:plc:test123");
      expect(getSession).toHaveBeenCalledWith("did:plc:test123", { allowStale: true });
    });

    it("should load persisted session without expiresAt field (backward compatibility)", async () => {
      const sessionWithoutExpiry = {
        did: "did:plc:test123",
        handle: "test.bsky.social",
        accessJwt: "token",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date().toISOString(),
        // No expiresAt field
        profile: { did: "did:plc:test123", handle: "test.bsky.social" },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionWithoutExpiry));

      const { getSession } = await import("@atcute/oauth-browser-client");
      (getSession as any).mockResolvedValue({
        info: { sub: "did:plc:test123" },
        token: { access: "token" },
      });

      authManager = new OAuthAuthManager();
      await authManager.initialize();

      const state = authManager.getState();
      expect(state.state).toBe("authenticated");
      expect(state.session?.did).toBe("did:plc:test123");
      expect(getSession).toHaveBeenCalledWith("did:plc:test123", { allowStale: true });
    });
  });

  describe("utility methods", () => {
    beforeEach(async () => {
      authManager = new OAuthAuthManager();
      await authManager.initialize();
    });

    it("should format errors correctly", () => {
      const testError = new Error("Test error");
      const result = (authManager as any).formatError(testError);

      expect(result).toMatchObject({
        code: "OAUTH_ERROR",
        message: "Test error",
      });
      expect(result.details).toBeDefined();
      expect(result.details.stack).toBeDefined();
    });

    it("should format unknown errors", () => {
      const result = (authManager as any).formatError("unknown error");

      // String errors now get OAUTH_ERROR code
      expect(result).toMatchObject({
        code: "OAUTH_ERROR",
        message: "unknown error",
      });
    });
  });
});
