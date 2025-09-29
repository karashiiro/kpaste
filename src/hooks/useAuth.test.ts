/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { OAuthAuthManager } from "../auth/OAuthAuthManager";
import type { AuthStateData } from "../auth/types";
import type { Did } from "@atcute/lexicons";

// Mock the OAuthAuthManager class
vi.mock("../auth/OAuthAuthManager");
const MockOAuthAuthManager = vi.mocked(OAuthAuthManager);

describe("useAuth", () => {
  let mockAuthManager: any;
  let mockListeners: Set<(state: AuthStateData) => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockListeners = new Set();

    mockAuthManager = {
      getState: vi.fn(),
      addListener: vi.fn((listener) => {
        mockListeners.add(listener);
        return () => mockListeners.delete(listener);
      }),
      startLogin: vi.fn(),
      handleOAuthCallback: vi.fn(),
      logout: vi.fn(),
      getClient: vi.fn(),
      getAgent: vi.fn(),
    };

    MockOAuthAuthManager.mockImplementation(() => mockAuthManager);

    // Reset module imports
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("basic functionality", () => {
    it("should initialize with unauthenticated state", async () => {
      const mockState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.authState).toEqual(mockState);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it("should return authenticated state correctly", async () => {
      const session = {
        did: "did:plc:test123" as Did,
        handle: "test.bsky.social",
        accessJwt: "test-jwt",
        refreshJwt: "test-refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date(),
        profile: {
          did: "did:plc:test123",
          handle: "test.bsky.social",
          displayName: "Test User",
        },
      };

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
        session,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.authState).toEqual(mockState);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.session).toEqual(session);
      expect(result.current.user).toEqual(session.profile);
    });

    it("should return authenticating state correctly", async () => {
      const mockState: AuthStateData = {
        state: "authenticating",
        isLoading: true,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAuthenticating).toBe(true);
      expect(result.current.hasError).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it("should return error state correctly", async () => {
      const mockState: AuthStateData = {
        state: "error",
        isLoading: false,
        error: { code: "AUTH_FAILED", message: "Login failed" },
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toEqual({
        code: "AUTH_FAILED",
        message: "Login failed",
      });
    });
  });

  describe("state updates", () => {
    it("should update state when auth manager notifies listeners", async () => {
      const initialState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
      };
      const newState: AuthStateData = {
        state: "authenticating",
        isLoading: true,
      };

      mockAuthManager.getState
        .mockReturnValueOnce(initialState)
        .mockReturnValueOnce(initialState)
        .mockReturnValue(newState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.authState).toEqual(initialState);

      // Simulate state change notification
      act(() => {
        mockListeners.forEach((listener) => listener(newState));
      });

      expect(result.current.authState).toEqual(newState);
      expect(result.current.isAuthenticating).toBe(true);
    });
  });

  describe("session expiry utilities", () => {
    it("should detect expired session", async () => {
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      const session = {
        did: "did:plc:test" as Did,
        handle: "test.bsky.social",
        accessJwt: "jwt",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date(),
        expiresAt: expiredDate,
        profile: { did: "did:plc:test", handle: "test.bsky.social" },
      };

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
        session,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.isSessionExpired).toBe(true);
      expect(result.current.timeUntilExpiry).toBe(0);
    });

    it("should detect valid session", async () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      const session = {
        did: "did:plc:test" as Did,
        handle: "test.bsky.social",
        accessJwt: "jwt",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date(),
        expiresAt: futureDate,
        profile: { did: "did:plc:test", handle: "test.bsky.social" },
      };

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
        session,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.isSessionExpired).toBe(false);
      expect(result.current.timeUntilExpiry).toBeGreaterThan(50000);
      expect(result.current.timeUntilExpiry).toBeLessThanOrEqual(60000);
    });

    it("should handle session without expiry", async () => {
      const session = {
        did: "did:plc:test" as Did,
        handle: "test.bsky.social",
        accessJwt: "jwt",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date(),
        // No expiresAt
        profile: { did: "did:plc:test", handle: "test.bsky.social" },
      };

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
        session,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.isSessionExpired).toBe(false);
      expect(result.current.timeUntilExpiry).toBe(null);
    });
  });

  describe("action methods", () => {
    it("should call startLogin with correct parameters", async () => {
      const mockState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      const loginRequest = { handle: "test.bsky.social" };

      await act(async () => {
        await result.current.startLogin(loginRequest);
      });

      expect(mockAuthManager.startLogin).toHaveBeenCalledWith(loginRequest);
    });

    it("should call handleOAuthCallback with correct parameters", async () => {
      const mockState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      const params = new URLSearchParams("code=123&state=456");

      await act(async () => {
        await result.current.handleOAuthCallback(params);
      });

      expect(mockAuthManager.handleOAuthCallback).toHaveBeenCalledWith(params);
    });

    it("should call logout", async () => {
      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthManager.logout).toHaveBeenCalled();
    });

    it("should return client from getClient", async () => {
      const mockClient = { post: vi.fn(), get: vi.fn() };
      mockAuthManager.getClient.mockReturnValue(mockClient);

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      const client = result.current.getClient();

      expect(mockAuthManager.getClient).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it("should return agent from getAgent", async () => {
      const mockAgent = { handler: {} };
      mockAuthManager.getAgent.mockReturnValue(mockAgent);

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      const agent = result.current.getAgent();

      expect(mockAuthManager.getAgent).toHaveBeenCalled();
      expect(agent).toBe(mockAgent);
    });
  });

  describe("function stability", () => {
    it("should return stable function references", async () => {
      const mockState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result, rerender } = renderHook(() => useAuth());

      const firstRender = {
        startLogin: result.current.startLogin,
        handleOAuthCallback: result.current.handleOAuthCallback,
        logout: result.current.logout,
        getClient: result.current.getClient,
        getAgent: result.current.getAgent,
      };

      rerender();

      expect(result.current.startLogin).toBe(firstRender.startLogin);
      expect(result.current.handleOAuthCallback).toBe(
        firstRender.handleOAuthCallback,
      );
      expect(result.current.logout).toBe(firstRender.logout);
      expect(result.current.getClient).toBe(firstRender.getClient);
      expect(result.current.getAgent).toBe(firstRender.getAgent);
    });
  });

  describe("edge cases", () => {
    it("should handle undefined session gracefully", async () => {
      const mockState: AuthStateData = {
        state: "unauthenticated",
        isLoading: false,
        session: undefined,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBeUndefined();
      expect(result.current.user).toBeUndefined();
      expect(result.current.isSessionExpired).toBe(false);
      expect(result.current.timeUntilExpiry).toBe(null);
    });

    it("should handle session with undefined profile", async () => {
      const session = {
        did: "did:plc:test",
        handle: "test.bsky.social",
        accessJwt: "jwt",
        refreshJwt: "refresh",
        active: true,
        endpoint: { url: "https://bsky.social", name: "bsky.social" },
        createdAt: new Date(),
        profile: undefined,
      };

      const mockState: AuthStateData = {
        state: "authenticated",
        isLoading: false,
        session: session as any,
      };
      mockAuthManager.getState.mockReturnValue(mockState);

      const { useAuth } = await import("./useAuth");
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeUndefined();
    });
  });

  describe("initializeAuth function", () => {
    it("should create new auth manager with default config", async () => {
      const { initializeAuth } = await import("./useAuth");

      const manager = initializeAuth();

      expect(MockOAuthAuthManager).toHaveBeenCalledWith(undefined);
      expect(manager).toBe(mockAuthManager);
    });

    it("should create new auth manager with custom config", async () => {
      const { initializeAuth } = await import("./useAuth");

      const customConfig = {
        storageKey: "custom-key",
        autoRefresh: false,
      };

      const manager = initializeAuth(customConfig);

      expect(MockOAuthAuthManager).toHaveBeenCalledWith(customConfig);
      expect(manager).toBe(mockAuthManager);
    });
  });
});
