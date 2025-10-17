// Main OAuth manager
export { OAuthAuthManager } from "./OAuthAuthManager";

// React hook
export { useAuth, initializeAuth } from "./useAuth";
export type { UseAuthReturn } from "./useAuth";

// Types
export type {
  AuthState,
  AuthStateData,
  AuthStateChangeListener,
  AuthSession,
  AuthError,
  AuthManagerConfig,
  ServiceEndpoint,
  UserProfile,
} from "./types";
