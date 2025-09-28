import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData, useParams } from "react-router";
import { PasteList } from "../paste/PasteList";
import type { PasteListLoaderData } from "../../loaders/pasteListLoader";
import { useAuth } from "../../hooks/useAuth";
import { PasteListPaginationButtons } from "../paste/PasteListPaginationButtons";
import { PageContainer } from "../layout/PageContainer";
import { ActionButton } from "../ui/ActionButton";
import { useAuthModal } from "../../hooks/useAuthContext";

export function PasteListPage() {
  const { isAuthenticated, session } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { handle: userHandle } = useParams();
  const { pastes } = useLoaderData() as PasteListLoaderData;

  // Check if viewing current user's own pastes
  const isViewingOwnPastes = isAuthenticated && session?.handle === userHandle;

  if (!userHandle) {
    // Will never happen as this would have thrown in pasteListLoader
    return <></>;
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <PageContainer flex={1}>
        <YStack gap="$6">
          <YStack gap="$4">
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <BookOpenIcon width={32} height={32} />
                <Paragraph fontSize="$8" fontWeight="700">
                  {isViewingOwnPastes
                    ? "Your Pastes"
                    : userHandle
                      ? `${userHandle}'s Pastes`
                      : "Browse Pastes"}
                </Paragraph>
              </XStack>
              <Paragraph fontSize="$4">
                {isViewingOwnPastes
                  ? "Manage all your pastes"
                  : userHandle
                    ? `View pastes shared by @${userHandle}`
                    : "Discover and view shared pastes"}
              </Paragraph>
            </YStack>

            {/* Only show create button when viewing your own pastes or when unauthenticated */}
            {(!isAuthenticated || isViewingOwnPastes) && (
              <XStack gap="$3" flexWrap="wrap">
                {isAuthenticated ? (
                  <Link
                    to="/"
                    style={{ textDecoration: "none", flex: 1, minWidth: 120 }}
                  >
                    <ActionButton
                      colorVariant="green"
                      size="$4"
                      width="100%"
                      icon={
                        <SparklesIcon
                          width={20}
                          height={20}
                          color="var(--greenText)"
                        />
                      }
                    >
                      Create New Paste
                    </ActionButton>
                  </Link>
                ) : (
                  <ActionButton
                    colorVariant="green"
                    size="$4"
                    width="100%"
                    icon={
                      <SparklesIcon
                        width={20}
                        height={20}
                        color="var(--greenText)"
                      />
                    }
                    onPress={openAuthModal}
                  >
                    Login to Create Paste
                  </ActionButton>
                )}
              </XStack>
            )}

            <PasteListPaginationButtons />
          </YStack>

          <PasteList
            pastes={pastes}
            userHandle={userHandle}
            currentUserSession={session}
          />

          <PasteListPaginationButtons />
        </YStack>
      </PageContainer>
    </YStack>
  );
}
