import { useCallback } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { YStack } from "@tamagui/stacks";
import { InsetButton } from "./InsetButton";
import { Paragraph, H1 } from "@tamagui/text";
import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";
import { PageContainer } from "../layout/PageContainer";
import { isRouteErrorResponse } from "react-router";

interface AppErrorBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
}

// Check if this is a chunk loading error
const isChunkError = (error: Error): boolean => {
  return error.message.includes("Failed to fetch dynamically imported module");
};

type ErrorFallbackProps = FallbackProps;

function getErrorMessage(error: Error): string {
  if (isRouteErrorResponse(error)) {
    return `Error ${error.status}: ${error.statusText}`;
  }

  if (isChunkError(error)) {
    return "A loading error occurred. Please try refreshing the page or going back to home.";
  }

  return "An unexpected error occurred. Please try refreshing the page or going back to home.";
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isChunk = isChunkError(error);

  const handleRetry = useCallback(() => {
    if (isChunk) {
      // If this is a chunk error, just reload the page for the most reliable fix
      window.location.reload();
    } else {
      // For non-chunk errors, try resetting the error boundary first
      resetErrorBoundary();
    }
  }, [isChunk, resetErrorBoundary]);

  const handleGoHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <PageContainer flex={1} justifyContent="center" alignItems="center">
        <YStack gap="$4" alignItems="center" maxWidth={500} padding="$6">
          <H1
            fontSize="$9"
            fontWeight="800"
            textAlign="center"
            color="$redBase"
          >
            Something went wrong
          </H1>
          <Paragraph fontSize="$5" textAlign="center" opacity={0.8}>
            {getErrorMessage(error)}
          </Paragraph>
          {error.message && (
            <Paragraph
              fontSize="$3"
              textAlign="center"
              opacity={0.6}
              fontFamily="$mono"
            >
              {error.message}
            </Paragraph>
          )}
          <YStack gap="$3" width="100%">
            <InsetButton
              onPress={handleRetry}
              theme="green"
              size="$5"
              icon={<ArrowPathIcon width={20} height={20} />}
            >
              Try Again
            </InsetButton>
            <InsetButton
              onPress={handleGoHome}
              theme="blue"
              size="$4"
              icon={<HomeIcon width={20} height={20} />}
            >
              Go to Home
            </InsetButton>
          </YStack>
        </YStack>
      </PageContainer>
    </YStack>
  );
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
