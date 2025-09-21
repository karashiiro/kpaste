import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { ServiceEndpoint } from "../auth/types";

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
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2>🎉 Welcome to AtProto Auth Demo!</h2>

        <div
          style={{
            background: "#f0f8ff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>✨ Session Info</h3>
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
            <p style={{ color: "red" }}>⚠️ Session has expired!</p>
          )}
        </div>

        {user && (
          <div
            style={{
              background: "#f8f0ff",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3>👤 User Profile</h3>
            <p>
              <strong>Display Name:</strong> {user.displayName || "Not set"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {user.description || "No description"}
            </p>
            {user.avatar && (
              <img
                src={user.avatar}
                alt="Avatar"
                style={{ width: "64px", height: "64px", borderRadius: "50%" }}
              />
            )}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={logout}
            disabled={isLoading}
            style={{
              background: "#ff6b6b",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {isLoading ? "🔄 Logging out..." : "👋 Logout"}
          </button>
        </div>
      </div>
    );
  }

  if (requiresTwoFactor && twoFactorChallenge) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <h2>🔐 Two-Factor Authentication</h2>

        <div
          style={{
            background: "#fff3cd",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
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

        <form onSubmit={handleTwoFactorSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Verification Code:
            </label>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                textAlign: "center",
                letterSpacing: "2px",
              }}
              required
            />
          </div>

          {hasError && error && (
            <div
              style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              ❌ {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !twoFactorCode}
            style={{
              width: "100%",
              background: twoFactorCode ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "4px",
              cursor: twoFactorCode ? "pointer" : "not-allowed",
              fontSize: "16px",
            }}
          >
            {isLoading ? "🔄 Verifying..." : "✅ Verify Code"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            onClick={logout}
            disabled={isLoading}
            style={{
              background: "transparent",
              color: "#6c757d",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>🚀 AtProto Authentication</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Connect to any AtProto service with flexible endpoint configuration!
      </p>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Service Endpoint:
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="url"
              value={loginForm.endpoint}
              onChange={(e) =>
                setLoginForm({ ...loginForm, endpoint: e.target.value })
              }
              placeholder="https://bsky.social"
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              required
            />
            <button
              type="button"
              onClick={handleValidateEndpoint}
              disabled={endpointValidation.isValidating}
              style={{
                padding: "12px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {endpointValidation.isValidating ? "🔄" : "✓"}
            </button>
          </div>
          {endpointValidation.isValid !== undefined && (
            <small
              style={{
                color: endpointValidation.isValid ? "green" : "red",
                display: "block",
                marginTop: "4px",
              }}
            >
              {endpointValidation.isValid
                ? "✅ Valid endpoint"
                : "❌ Invalid endpoint"}
            </small>
          )}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Handle or Email:
          </label>
          <input
            type="text"
            value={loginForm.identifier}
            onChange={(e) =>
              setLoginForm({ ...loginForm, identifier: e.target.value })
            }
            placeholder="your.handle or email@example.com"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Password:
          </label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            required
          />
        </div>

        {hasError && error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            ❌ {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            background: isLoading ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isAuthenticating ? "🔄 Connecting..." : "🚀 Connect"}
        </button>
      </form>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#e9ecef",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        <h4 style={{ marginTop: 0 }}>🎮 Demo Features:</h4>
        <ul style={{ marginBottom: 0 }}>
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
