import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { ServiceEndpoint } from "../auth/types";
import { resolveUser } from "../pdsUtils";
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
} from "tamagui";
import {
  XMarkIcon,
  LockClosedIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

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
  } = useAuth();

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    endpoint: "https://bsky.social",
  });

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isResolvingEndpoint, setIsResolvingEndpoint] = useState(false);

  // Auto-resolve service endpoint from handle
  const resolveServiceEndpoint = async (handle: string) => {
    if (!handle || !handle.includes(".")) {
      // Not a proper handle, use default
      setLoginForm((prev) => ({ ...prev, endpoint: "https://bsky.social" }));
      return;
    }

    setIsResolvingEndpoint(true);

    try {
      const { pdsUrl } = await resolveUser(handle);
      setLoginForm((prev) => ({ ...prev, endpoint: pdsUrl }));
    } catch (error) {
      console.warn("Failed to resolve endpoint for handle:", error);
      // Fallback to default
      setLoginForm((prev) => ({ ...prev, endpoint: "https://bsky.social" }));
    } finally {
      setIsResolvingEndpoint(false);
    }
  };

  const handleLogin = async () => {
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

  const handleTwoFactorSubmit = async () => {
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

  const handleIdentifierChange = (text: string) => {
    setLoginForm({ ...loginForm, identifier: text });

    // Auto-resolve endpoint when identifier looks like a handle
    if (text && text.includes(".") && !text.includes("@")) {
      resolveServiceEndpoint(text);
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
      <Sheet.Frame padding="$4" alignItems="center" gap="$5">
        <YStack gap="$4" maxWidth={400} width="100%">
          <XStack justifyContent="center" alignItems="center" gap="$2">
            {requiresTwoFactor ? (
              <LockClosedIcon width={32} height={32} />
            ) : (
              <RocketLaunchIcon width={32} height={32} />
            )}
            <H2 textAlign="center">
              {requiresTwoFactor
                ? "Two-Factor Authentication"
                : "Login to Bluesky"}
            </H2>
          </XStack>

          {requiresTwoFactor && twoFactorChallenge ? (
            <YStack gap="$4">
              <Card backgroundColor="$blue2" padding="$4">
                <YStack gap="$2">
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

              <YStack gap="$3">
                <YStack gap="$2">
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
                    <XStack alignItems="center" gap="$2">
                      <XMarkIcon width={20} height={20} color="red" />
                      <Text color="$red10">{error.message}</Text>
                    </XStack>
                  </Card>
                )}

                <Button
                  onPress={() => handleTwoFactorSubmit()}
                  disabled={isLoading || !twoFactorCode}
                  backgroundColor="$green9"
                  color="white"
                  size="$4"
                  fontWeight="600"
                >
                  <XStack alignItems="center" gap="$2">
                    {isLoading ? (
                      <ArrowPathIcon width={20} height={20} color="white" />
                    ) : (
                      <CheckCircleIcon width={20} height={20} color="white" />
                    )}
                    <Text color="white">
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Text>
                  </XStack>
                </Button>
              </YStack>
            </YStack>
          ) : (
            <YStack gap="$4">
              <Text textAlign="center">
                Connect to Bluesky or any compatible service
              </Text>

              <YStack gap="$3">
                <YStack gap="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Handle or Email:
                  </Label>
                  <Input
                    value={loginForm.identifier}
                    onChangeText={handleIdentifierChange}
                    placeholder="your.handle or email@example.com"
                  />
                </YStack>

                <YStack gap="$2">
                  <Label fontSize="$4" fontWeight="600">
                    Service Endpoint:
                  </Label>
                  <XStack gap="$2" alignItems="center">
                    <Input
                      flex={1}
                      value={loginForm.endpoint}
                      editable={false}
                      backgroundColor="$gray2"
                      color="$gray10"
                    />
                    {isResolvingEndpoint && (
                      <ArrowPathIcon
                        width={16}
                        height={16}
                        color="gray"
                        className="animate-spin"
                      />
                    )}
                  </XStack>
                  <Text fontSize="$2" color="$gray10">
                    Auto-resolved from handle
                  </Text>
                </YStack>

                <YStack gap="$2">
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
                    <XStack alignItems="center" gap="$2">
                      <XMarkIcon width={20} height={20} color="red" />
                      <Text color="$red10">{error.message}</Text>
                    </XStack>
                  </Card>
                )}

                <Button
                  onPress={() => handleLogin()}
                  disabled={isLoading}
                  backgroundColor="$blue9"
                  color="white"
                  size="$4"
                  fontWeight="600"
                >
                  <XStack alignItems="center" gap="$2">
                    {isAuthenticating ? (
                      <ArrowPathIcon width={20} height={20} color="white" />
                    ) : (
                      <RocketLaunchIcon width={20} height={20} color="white" />
                    )}
                    <Text color="white">
                      {isAuthenticating ? "Connecting..." : "Connect"}
                    </Text>
                  </XStack>
                </Button>
              </YStack>
            </YStack>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
