import { useState, useEffect, useCallback, useRef } from "react";
import { AtProtoAuthManager } from "../auth/AtProtoAuthManager";
import type {
  AuthStateData,
  LoginCredentials,
  TwoFactorVerification,
  ServiceEndpoint,
  AtProtoClient,
  AuthManagerConfig,
} from "../auth/types";

let globalAuthManager: AtProtoAuthManager | null = null;

export function initializeAuth(config?: AuthManagerConfig): AtProtoAuthManager {
  if (!globalAuthManager) {
    globalAuthManager = new AtProtoAuthManager(config);
  }
  return globalAuthManager;
}

export function useAuth() {
  const authManagerRef = useRef<AtProtoAuthManager | null>(null);
  const [authState, setAuthState] = useState<AuthStateData>(() => {
    if (!authManagerRef.current) {
      authManagerRef.current = globalAuthManager || initializeAuth();
    }
    return authManagerRef.current.getState();
  });

  useEffect(() => {
    const authManager = authManagerRef.current!;

    const unsubscribe = authManager.addListener((newState) => {
      setAuthState(newState);
    });

    setAuthState(authManager.getState());

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    return authManagerRef.current!.login(credentials);
  }, []);

  const verifyTwoFactor = useCallback(
    async (verification: TwoFactorVerification) => {
      return authManagerRef.current!.verifyTwoFactor(verification);
    },
    [],
  );

  const logout = useCallback(async () => {
    return authManagerRef.current!.logout();
  }, []);

  const refreshSession = useCallback(async () => {
    return authManagerRef.current!.refreshSession();
  }, []);

  const validateServiceEndpoint = useCallback(
    async (endpoint: ServiceEndpoint) => {
      return authManagerRef.current!.validateServiceEndpoint(endpoint);
    },
    [],
  );

  const getClient = useCallback((): AtProtoClient | null => {
    return authManagerRef.current!.getClient();
  }, []);

  return {
    // State
    authState,
    isAuthenticated: authState.state === "authenticated",
    isAuthenticating: authState.state === "authenticating",
    requiresTwoFactor: authState.state === "requires2fa",
    hasError: authState.state === "error",
    isLoading: authState.isLoading,

    // Data
    session: authState.session,
    error: authState.error,
    twoFactorChallenge: authState.twoFactorChallenge,
    user: authState.session?.profile,

    // Actions
    login,
    verifyTwoFactor,
    logout,
    refreshSession,
    validateServiceEndpoint,
    getClient,

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
