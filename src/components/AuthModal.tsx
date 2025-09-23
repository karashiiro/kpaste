import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { ServiceEndpoint } from "../auth/types";
import {
  Sheet,
  XStack,
  YStack,
  Text,
  H2,
  Button,
  Input,
  Label,
  Card,
  Separator,
} from "tamagui";

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

  return (
    <Sheet
      forceRemoveScrollEnabled={isOpen}
      modal={true}
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[85, 50, 25]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        justifyContent="center"
        alignItems="center"
        space="$5"
      >
        <YStack space="$4" maxWidth={400} width="100%">
          <H2 textAlign="center">
            {requiresTwoFactor
              ? "🔐 Two-Factor Authentication"
              : "🚀 Login to AT Protocol"}
          </H2>

          {requiresTwoFactor && twoFactorChallenge ? (
            <YStack space="$4">
              <Card backgroundColor="$blue2" padding="$4">
                <YStack space="$2">
                  <Text>
                    <Text fontWeight="bold">Method:</Text>{" "}
                    {twoFactorChallenge.method.toUpperCase()}
                  </Text>
                  {twoFactorChallenge.destination && (
                    <Text>
                      <Text fontWeight="bold">Sent to:</Text>{" "}
                      {twoFactorChallenge.destination}
                    </Text>
                  )}
                  <Text>
                    <Text fontWeight="bold">Expires:</Text>{" "}
                    {twoFactorChallenge.expiresAt.toLocaleString()}
                  </Text>
                </YStack>
              </Card>

              <YStack space="$3">
                <YStack space="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Verification Code:
                  </Label>
                  <Input
                    value={twoFactorCode}
                    onChangeText={setTwoFactorCode}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    textAlign="center"
                    fontSize="$6"
                    fontWeight="600"
                  />
                </YStack>

                {hasError && error && (
                  <Card backgroundColor="$red2" padding="$3">
                    <Text color="$red10">❌ {error.message}</Text>
                  </Card>
                )}

                <Button
                  onPress={() => handleTwoFactorSubmit({} as React.FormEvent)}
                  disabled={isLoading || !twoFactorCode}
                  backgroundColor="$green9"
                  color="white"
                  size="$4"
                  fontWeight="600"
                >
                  {isLoading ? "🔄 Verifying..." : "✅ Verify Code"}
                </Button>
              </YStack>
            </YStack>
          ) : (
            <YStack space="$4">
              <Text textAlign="center">Connect to any AT Protocol service</Text>

              <YStack space="$3">
                <YStack space="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Service Endpoint:
                  </Label>
                  <XStack space="$2">
                    <Input
                      flex={1}
                      value={loginForm.endpoint}
                      onChangeText={(text) =>
                        setLoginForm({ ...loginForm, endpoint: text })
                      }
                      placeholder="https://bsky.social"
                    />
                    <Button
                      onPress={handleValidateEndpoint}
                      disabled={endpointValidation.isValidating}
                      backgroundColor="$blue9"
                      color="white"
                      size="$3"
                    >
                      {endpointValidation.isValidating ? "🔄" : "✓"}
                    </Button>
                  </XStack>
                  {endpointValidation.isValid !== undefined && (
                    <Text
                      fontSize="$2"
                      color={endpointValidation.isValid ? "$green10" : "$red10"}
                    >
                      {endpointValidation.isValid
                        ? "✅ Valid endpoint"
                        : "❌ Invalid endpoint"}
                    </Text>
                  )}
                </YStack>

                <YStack space="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Handle or Email:
                  </Label>
                  <Input
                    value={loginForm.identifier}
                    onChangeText={(text) =>
                      setLoginForm({ ...loginForm, identifier: text })
                    }
                    placeholder="your.handle or email@example.com"
                  />
                </YStack>

                <YStack space="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Password:
                  </Label>
                  <Input
                    secureTextEntry
                    value={loginForm.password}
                    onChangeText={(text) =>
                      setLoginForm({ ...loginForm, password: text })
                    }
                    placeholder="Enter your password"
                  />
                </YStack>

                {hasError && error && (
                  <Card backgroundColor="$red2" padding="$3">
                    <Text color="$red10">❌ {error.message}</Text>
                  </Card>
                )}

                <Button
                  onPress={() => handleLogin({} as React.FormEvent)}
                  disabled={isLoading}
                  backgroundColor="$blue9"
                  color="white"
                  size="$4"
                  fontWeight="600"
                >
                  {isAuthenticating ? "🔄 Connecting..." : "🚀 Connect"}
                </Button>
              </YStack>

              <Separator />

              <Card backgroundColor="$blue2" padding="$4">
                <YStack space="$2">
                  <Text fontWeight="600" fontSize="$4">
                    Features:
                  </Text>
                  <YStack space="$1">
                    <Text fontSize="$3">
                      ✅ Flexible endpoint configuration
                    </Text>
                    <Text fontSize="$3">🔐 Two-factor authentication</Text>
                    <Text fontSize="$3">💾 Session persistence</Text>
                    <Text fontSize="$3">🔄 Automatic token refresh</Text>
                  </YStack>
                </YStack>
              </Card>
            </YStack>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
