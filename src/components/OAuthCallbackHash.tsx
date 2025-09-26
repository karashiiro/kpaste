import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { YStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Paragraph } from "@tamagui/text";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

export function OAuthCallbackHash() {
  const navigate = useNavigate();
  const { handleOAuthCallback, authState } = useAuth();
  const processedRef = useRef(false);

  // Helper function to handle navigation with return URL cleanup
  const navigateWithReturnUrl = useCallback(
    (defaultPath: string = "/") => {
      const returnUrl = localStorage.getItem("kpaste_return_url");
      localStorage.removeItem("kpaste_return_url");
      navigate(returnUrl || defaultPath, { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    const processCallback = async () => {
      if (processedRef.current) {
        return;
      }

      try {
        // Get OAuth data from localStorage
        const oauthDataStr = localStorage.getItem("kpaste_oauth_callback");
        if (!oauthDataStr) {
          navigateWithReturnUrl();
          return;
        }

        const oauthData = JSON.parse(oauthDataStr);

        // Check if data is not too old (5 minutes max)
        const maxAge = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - oauthData.timestamp > maxAge) {
          localStorage.removeItem("kpaste_oauth_callback");
          navigateWithReturnUrl();
          return;
        }

        // Parse the OAuth parameters
        const oauthParams = new URLSearchParams(oauthData.params);

        // Check if we have valid OAuth parameters
        if (
          oauthParams.has("state") ||
          oauthParams.has("code") ||
          oauthParams.has("error")
        ) {
          processedRef.current = true;

          // Clean up localStorage
          localStorage.removeItem("kpaste_oauth_callback");

          // Process the OAuth callback
          await handleOAuthCallback(oauthParams);

          // Small delay to ensure auth state is updated
          setTimeout(() => {
            navigateWithReturnUrl();
          }, 100);
        } else {
          localStorage.removeItem("kpaste_oauth_callback");
          navigateWithReturnUrl();
        }
      } catch {
        // Clean up localStorage on error
        localStorage.removeItem("kpaste_oauth_callback");

        // Redirect to original page after delay
        setTimeout(() => {
          navigateWithReturnUrl();
        }, 3000);
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate, navigateWithReturnUrl]);

  if (authState.state === "authenticated") {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$6"
        gap="$4"
        backgroundColor="#0a0a0a"
      >
        <Card padding="$4" theme="green">
          <YStack alignItems="center" gap="$3">
            <CheckCircleIcon width={48} height={48} color="green" />
            <Paragraph fontSize="$6" fontWeight="600" textAlign="center">
              Login Successful!
            </Paragraph>
            <Paragraph fontSize="$4" textAlign="center">
              Redirecting you now...
            </Paragraph>
          </YStack>
        </Card>
      </YStack>
    );
  }

  if (authState.state === "error") {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$6"
        gap="$4"
        backgroundColor="#0a0a0a"
      >
        <Card padding="$4" theme="red">
          <YStack alignItems="center" gap="$3">
            <XMarkIcon width={48} height={48} color="red" />
            <Paragraph fontSize="$6" fontWeight="600" textAlign="center">
              Login Failed
            </Paragraph>
            <Paragraph fontSize="$4" textAlign="center">
              {authState.error?.message || "An error occurred during login"}
            </Paragraph>
            <Paragraph
              fontSize="$3"
              color="$blue10"
              textAlign="center"
              textDecorationLine="underline"
              cursor="pointer"
              onPress={() => navigate("/", { replace: true })}
            >
              ← Back to KPaste
            </Paragraph>
          </YStack>
        </Card>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      gap="$4"
      backgroundColor="#0a0a0a"
    >
      <Card padding="$4" theme="blue">
        <YStack alignItems="center" gap="$3">
          <ArrowPathIcon
            width={48}
            height={48}
            color="blue"
            className="animate-spin"
          />
          <Paragraph fontSize="$6" fontWeight="600" textAlign="center">
            Completing Login...
          </Paragraph>
          <Paragraph fontSize="$4" textAlign="center">
            Processing your authentication from storage.
          </Paragraph>
        </YStack>
      </Card>
    </YStack>
  );
}
