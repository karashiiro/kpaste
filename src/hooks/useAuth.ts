import { useState, useEffect, useCallback, useRef } from "react";
import { OAuthAuthManager } from "../auth/OAuthAuthManager";
import type { OAuthLoginRequest } from "../auth/OAuthAuthManager";
import type { AuthStateData, AuthManagerConfig } from "../auth/types";
import type { Client } from "@atcute/client";

let globalAuthManager: OAuthAuthManager | null = null;

export function initializeAuth(config?: AuthManagerConfig): OAuthAuthManager {
  if (!globalAuthManager) {
    globalAuthManager = new OAuthAuthManager(config);
  }
  return globalAuthManager;
}

export function useAuth() {
  const authManagerRef = useRef<OAuthAuthManager | null>(null);
  const [authState, setAuthState] = useState<AuthStateData>(() => {
    if (!authManagerRef.current) {
      authManagerRef.current = globalAuthManager || initializeAuth();
    }
    return authManagerRef.current.getState();
  });

  useEffect(() => {
    const authManager = authManagerRef.current!;

    // Add listener first
    const unsubscribe = authManager.addListener((newState) => {
      setAuthState(newState);
    });

    // Initialize the auth manager (loads persisted session)
    // This must happen after listener is added so we get state updates
    authManager.initialize().catch((error) => {
      console.error("Failed to initialize auth manager:", error);
    });

    return unsubscribe;
  }, []);

  const startLogin = useCallback(async (request: OAuthLoginRequest) => {
    return authManagerRef.current!.startLogin(request);
  }, []);

  const handleOAuthCallback = useCallback(async (params: URLSearchParams) => {
    return authManagerRef.current!.handleOAuthCallback(params);
  }, []);

  const logout = useCallback(async () => {
    return authManagerRef.current!.logout();
  }, []);

  const getClient = useCallback((): Client | null => {
    return authManagerRef.current!.getClient();
  }, []);

  const getAgent = useCallback(() => {
    return authManagerRef.current!.getAgent();
  }, []);

  return {
    // State
    authState,
    isAuthenticated: authState.state === "authenticated",
    isAuthenticating: authState.state === "authenticating",
    hasError: authState.state === "error",
    isLoading: authState.isLoading,

    // Data
    session: authState.session,
    error: authState.error,
    user: authState.session?.profile,

    // Actions
    startLogin,
    handleOAuthCallback,
    logout,
    getClient,
    getAgent,

    // Utilities
    isSessionExpired: authState.session?.expiresAt
      ? authState.session.expiresAt < new Date()
      : false,
    timeUntilExpiry: authState.session?.expiresAt
      ? Math.max(0, authState.session.expiresAt.getTime() - Date.now())
      : null,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
