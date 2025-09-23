import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { ServiceEndpoint } from "../auth/types";
import { Modal } from "./Modal";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    isAuthenticated,
    isAuthenticating,
    requiresTwoFactor,
    hasError,
    isLoading,
    error,
    twoFactorChallenge,
    login,
    verifyTwoFactor,
    validateServiceEndpoint,
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

  // Close modal when authentication is successful
  React.useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setLoginForm({
        identifier: "",
        password: "",
        endpoint: "https://bsky.social",
      });
      setTwoFactorCode("");
      setEndpointValidation({ isValidating: false });
    }
  }, [isOpen]);

  const getModalTitle = () => {
    if (requiresTwoFactor) return "🔐 Two-Factor Authentication";
    return "🚀 Login to AT Protocol";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      {requiresTwoFactor && twoFactorChallenge ? (
        <div className={styles.authContent}>
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
        </div>
      ) : (
        <div className={styles.authContent}>
          <p className={styles.subtitle}>Connect to any AT Protocol service</p>

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

          <div className={styles.featuresInfo}>
            <h4>Features:</h4>
            <ul>
              <li>✅ Flexible endpoint configuration</li>
              <li>🔐 Two-factor authentication</li>
              <li>💾 Session persistence</li>
              <li>🔄 Automatic token refresh</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
