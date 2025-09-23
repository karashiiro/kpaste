import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { ServiceEndpoint } from "../auth/types";
import styles from "./AuthDemo.module.css";

export function AuthDemo() {
  const {
    isAuthenticated,
    isAuthenticating,
    requiresTwoFactor,
    hasError,
    isLoading,
    session,
    error,
    twoFactorChallenge,
    user,
    login,
    verifyTwoFactor,
    logout,
    validateServiceEndpoint,
    isSessionExpired,
    timeUntilExpiry,
  } = useAuth();

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    endpoint: "https://bsky.social",
  });

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [endpointValidation, setEndpointValidation] = useState<{
    isValidating: boolean;
    isValid?: boolean;
  }>({ isValidating: false });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceEndpoint: ServiceEndpoint = {
      url: loginForm.endpoint,
      name: new URL(loginForm.endpoint).hostname,
    };

    try {
      await login({
        identifier: loginForm.identifier,
        password: loginForm.password,
        endpoint: serviceEndpoint,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorChallenge) return;

    try {
      await verifyTwoFactor({
        challengeId: twoFactorChallenge.challengeId,
        code: twoFactorCode,
      });
      setTwoFactorCode("");
    } catch (err) {
      console.error("2FA verification failed:", err);
    }
  };

  const handleValidateEndpoint = async () => {
    setEndpointValidation({ isValidating: true });

    try {
      const isValid = await validateServiceEndpoint({
        url: loginForm.endpoint,
      });
      setEndpointValidation({ isValidating: false, isValid });
    } catch {
      setEndpointValidation({ isValidating: false, isValid: false });
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (isAuthenticated && session) {
    return (
      <div className={styles.authDemoWide}>
        <div className={styles.sessionCard}>
          <h3 className={styles.cardTitle}>✨ Session Info</h3>
          <div className={styles.cardContent}>
            <p>
              <strong>Handle:</strong> {session.handle}
            </p>
            <p>
              <strong>DID:</strong> {session.did}
            </p>
            <p>
              <strong>Service:</strong> {session.endpoint.url}
            </p>
            <p>
              <strong>Created:</strong> {session.createdAt.toLocaleString()}
            </p>
            {session.expiresAt && (
              <p>
                <strong>Expires:</strong> {session.expiresAt.toLocaleString()}
              </p>
            )}
            {timeUntilExpiry && (
              <p>
                <strong>Time remaining:</strong>{" "}
                {formatTimeRemaining(timeUntilExpiry)}
              </p>
            )}
            {isSessionExpired && (
              <p className={styles.expiredSession}>⚠️ Session has expired!</p>
            )}
          </div>
        </div>

        {user && (
          <div className={styles.userCard}>
            <h3 className={styles.cardTitle}>👤 User Profile</h3>
            <div className={styles.cardContent}>
              <p>
                <strong>Display Name:</strong> {user.displayName || "Not set"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {user.description || "No description"}
              </p>
              {user.avatar && (
                <img src={user.avatar} alt="Avatar" className={styles.avatar} />
              )}
            </div>
          </div>
        )}

        <div className={styles.centerText}>
          <button
            onClick={logout}
            disabled={isLoading}
            className={styles.dangerButton}
          >
            {isLoading ? "🔄 Logging out..." : "👋 Logout"}
          </button>
        </div>
      </div>
    );
  }

  if (requiresTwoFactor && twoFactorChallenge) {
    return (
      <div className={styles.authDemo}>
        <h2 className={styles.title}>🔐 Two-Factor Authentication</h2>

        <div className={styles.twoFactorCard}>
          <p>
            <strong>Method:</strong> {twoFactorChallenge.method.toUpperCase()}
          </p>
          {twoFactorChallenge.destination && (
            <p>
              <strong>Sent to:</strong> {twoFactorChallenge.destination}
            </p>
          )}
          <p>
            <strong>Expires:</strong>{" "}
            {twoFactorChallenge.expiresAt.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleTwoFactorSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Verification Code:</label>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={styles.twoFactorInput}
              required
            />
          </div>

          {hasError && error && (
            <div className={styles.errorMessage}>❌ {error.message}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !twoFactorCode}
            className={
              twoFactorCode
                ? styles.primaryButton
                : styles.primaryButtonDisabled
            }
          >
            {isLoading ? "🔄 Verifying..." : "✅ Verify Code"}
          </button>
        </form>

        <div className={`${styles.centerText} ${styles.spacingTop}`}>
          <button
            onClick={logout}
            disabled={isLoading}
            className={styles.linkButton}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authDemo}>
      <h2 className={styles.title}>🚀 AtProto Authentication</h2>
      <p className={styles.subtitle}>
        Connect to any AtProto service with flexible endpoint configuration!
      </p>

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Service Endpoint:</label>
          <div className={styles.endpointRow}>
            <input
              type="url"
              value={loginForm.endpoint}
              onChange={(e) =>
                setLoginForm({ ...loginForm, endpoint: e.target.value })
              }
              placeholder="https://bsky.social"
              className={styles.endpointInput}
              required
            />
            <button
              type="button"
              onClick={handleValidateEndpoint}
              disabled={endpointValidation.isValidating}
              className={styles.validateButton}
            >
              {endpointValidation.isValidating ? "🔄" : "✓"}
            </button>
          </div>
          {endpointValidation.isValid !== undefined && (
            <small
              className={
                endpointValidation.isValid
                  ? styles.validationSuccess
                  : styles.validationError
              }
            >
              {endpointValidation.isValid
                ? "✅ Valid endpoint"
                : "❌ Invalid endpoint"}
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Handle or Email:</label>
          <input
            type="text"
            value={loginForm.identifier}
            onChange={(e) =>
              setLoginForm({ ...loginForm, identifier: e.target.value })
            }
            placeholder="your.handle or email@example.com"
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Password:</label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            placeholder="Enter your password"
            className={styles.formInput}
            required
          />
        </div>

        {hasError && error && (
          <div className={styles.errorMessage}>❌ {error.message}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={
            isLoading ? styles.primaryButtonDisabled : styles.primaryButton
          }
        >
          {isAuthenticating ? "🔄 Connecting..." : "🚀 Connect"}
        </button>
      </form>

      <div className={styles.demoFeaturesCard}>
        <h4 className={styles.cardTitle}>🎮 Demo Features:</h4>
        <ul className={styles.featuresList}>
          <li>✅ Flexible service endpoint configuration</li>
          <li>🔐 Two-factor authentication support</li>
          <li>💾 Session persistence with localStorage</li>
          <li>🔄 Automatic token refresh</li>
          <li>🛡️ Type-safe error handling</li>
        </ul>
      </div>
    </div>
  );
}
