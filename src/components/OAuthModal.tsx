import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
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
  RocketLaunchIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OAuthModal({ isOpen, onClose }: OAuthModalProps) {
  const {
    isAuthenticated,
    isAuthenticating,
    hasError,
    isLoading,
    error,
    startLogin,
  } = useAuth();

  const [handle, setHandle] = useState("");

  const handleLogin = async () => {
    if (!handle.trim()) return;

    try {
      await startLogin({ handle: handle.trim() });
      // OAuth flow will redirect to authorization server
      // User will be redirected back to /oauth/callback
    } catch (err) {
      console.error("OAuth login failed:", err);
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
      setHandle("");
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
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" alignItems="center" gap="$5">
        <YStack gap="$4" maxWidth={400} width="100%">
          <XStack justifyContent="center" alignItems="center" gap="$2">
            <RocketLaunchIcon width={32} height={32} />
            <H2 textAlign="center">Login to Bluesky</H2>
          </XStack>

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
                  value={handle}
                  onChangeText={setHandle}
                  placeholder="Your handle"
                  disabled={isAuthenticating}
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
                onPress={handleLogin}
                disabled={isLoading || !handle.trim() || isAuthenticating}
                backgroundColor="$blue9"
                color="white"
                size="$4"
                fontWeight="600"
              >
                <XStack alignItems="center" gap="$2">
                  {isAuthenticating ? (
                    <ArrowPathIcon
                      width={20}
                      height={20}
                      color="white"
                      className="animate-spin"
                    />
                  ) : (
                    <RocketLaunchIcon width={20} height={20} color="white" />
                  )}
                  <Text color="white">
                    {isAuthenticating
                      ? "Redirecting..."
                      : "Continue with OAuth"}
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
