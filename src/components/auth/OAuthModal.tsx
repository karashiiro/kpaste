import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Sheet } from "@tamagui/sheet";
import { XStack, YStack } from "@tamagui/stacks";
import { Paragraph, H2 } from "@tamagui/text";
import { Input } from "@tamagui/input";
import { Label } from "@tamagui/label";
import { InsetCard } from "../ui/InsetCard";
import { InsetButton } from "../ui/InsetButton";
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
  useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  // Reset form when modal closes
  useEffect(() => {
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
            <RocketLaunchIcon width={32} height={32} color="white" />
            <H2 textAlign="center">Login to Bluesky</H2>
          </XStack>

          <YStack gap="$4">
            <Paragraph textAlign="center">
              Connect to Bluesky or any compatible service
            </Paragraph>

            <YStack gap="$3">
              <YStack gap="$2">
                <Label fontSize="$4" fontWeight="600">
                  Handle or Email:
                </Label>
                <Input
                  value={handle}
                  onChange={(e) =>
                    setHandle((e.target as HTMLInputElement).value)
                  }
                  placeholder="Your handle"
                  disabled={isAuthenticating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
              </YStack>

              {hasError && error && (
                <InsetCard backgroundColor="$red2" theme="red" padding="$3">
                  <XStack alignItems="center" gap="$2">
                    <XMarkIcon width={20} height={20} color="red" />
                    <Paragraph color="$red10">{error.message}</Paragraph>
                  </XStack>
                </InsetCard>
              )}

              <XStack gap="$3" width="100%">
                <InsetButton
                  onPress={onClose}
                  disabled={isAuthenticating}
                  size="$4"
                  fontWeight="600"
                  flex={1}
                >
                  <XStack alignItems="center" gap="$2">
                    <XMarkIcon width={20} height={20} color="white" />
                    <Paragraph>Cancel</Paragraph>
                  </XStack>
                </InsetButton>

                <InsetButton
                  onPress={handleLogin}
                  disabled={isLoading || !handle.trim() || isAuthenticating}
                  backgroundColor="$blue9"
                  color="white"
                  size="$4"
                  fontWeight="600"
                  flex={1}
                  theme="blue"
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
                    <Paragraph color="white">
                      {isAuthenticating
                        ? "Redirecting..."
                        : "Continue with OAuth"}
                    </Paragraph>
                  </XStack>
                </InsetButton>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
