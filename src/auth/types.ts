import type { AtpSessionData } from "@atcute/client";

export type AuthState =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "requires2fa"
  | "error";

export interface ServiceEndpoint {
  url: string;
  name?: string;
  verified?: boolean;
}

export interface UserProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
}

// Extend the atcute session data with our additional fields
export interface AuthSession extends AtpSessionData {
  endpoint: ServiceEndpoint;
  createdAt: Date;
  expiresAt?: Date;
  profile?: UserProfile;
}

export interface TwoFactorChallenge {
  challengeId: string;
  method: "totp" | "sms" | "email";
  destination?: string;
  expiresAt: Date;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  endpoint: ServiceEndpoint;
  twoFactorCode?: string;
}

export interface TwoFactorVerification {
  challengeId: string;
  code: string;
}

export interface AuthStateData {
  state: AuthState;
  session?: AuthSession;
  error?: AuthError;
  twoFactorChallenge?: TwoFactorChallenge;
  isLoading: boolean;
}

export type AuthStateChangeListener = (authData: AuthStateData) => void;

export interface AuthManagerConfig {
  storageKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number;
}
