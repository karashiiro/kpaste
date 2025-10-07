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
  AtSymbolIcon,
} from "@heroicons/react/24/outline";
import { Image } from "@tamagui/image";
import styles from "./OAuthModal.module.css";

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
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" alignItems="center" gap="$5">
        <YStack gap="$4" maxWidth={400} width="100%" alignItems="center">
          <H2 textAlign="center" fontWeight="700">
            Login with ATProto
          </H2>
          <YStack alignItems="center" gap="$4" maxWidth={350} width="100%">
            <XStack gap="$3" justifyContent="center">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Image
                  source={{
                    width: 19,
                    height: 16,
                    uri: "/brand/bsky.svg",
                  }}
                />
                <Paragraph fontWeight="500">
                  <a
                    href="https://bsky.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Bluesky
                  </a>
                </Paragraph>
              </XStack>
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Image
                  source={{
                    width: 19,
                    height: 19,
                    uri: "/brand/tangled.svg",
                  }}
                />
                <Paragraph fontWeight="500">
                  <a
                    href="https://tangled.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    tangled
                  </a>
                </Paragraph>
              </XStack>
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <AtSymbolIcon width={19} height={19} color="white" />
                <Paragraph fontWeight="500">...and more!</Paragraph>
              </XStack>
            </XStack>

            <YStack width="100%">
              <Label fontSize="$4" fontWeight="600">
                Handle:
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
              <Paragraph
                fontSize="$3"
                color="rgba(255, 255, 255, 0.8)"
                lineHeight={18}
              >
                Use your ATProto handle to sign in. Your handle is consistent
                across all ATProto apps.
              </Paragraph>
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
                  <Paragraph color="white" fontWeight="600">
                    {isAuthenticating
                      ? "Redirecting..."
                      : "Continue with OAuth"}
                  </Paragraph>
                </XStack>
              </InsetButton>
            </XStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
