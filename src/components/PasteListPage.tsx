import { YStack, View, XStack, Text, Button } from "tamagui";
import { BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData, useSearchParams, useParams } from "react-router";
import { PasteList } from "./PasteList";
import { AuthModal } from "./AuthModal";
import { Header } from "./Header";
import type { PasteListLoaderData } from "../loaders/pasteListLoader";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export function PasteListPage() {
  const { isAuthenticated, session } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { handle: userHandle } = useParams();
  const { pastes, nextCursor, cursor, prevCursor } =
    useLoaderData() as PasteListLoaderData;

  const [, setSearchParams] = useSearchParams();

  const handleNextPage = () => {
    if (nextCursor) {
      setSearchParams({ prev: cursor || "", cursor: nextCursor });
    }
  };

  const handlePrevPage = () => {
    // TODO: How do we get prev here?
    setSearchParams({ prev: "", cursor: prevCursor || "" });
  };

  // Check if viewing current user's own pastes
  const isViewingOwnPastes = isAuthenticated && session?.handle === userHandle;

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      {/* Main Content */}
      <View
        padding="$6"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        flex={1}
      >
        <YStack space="$6">
          <YStack space="$4">
            <YStack space="$2">
              <XStack alignItems="center" space="$2">
                <BookOpenIcon width={32} height={32} />
                <Text fontSize="$8" fontWeight="700">
                  {isViewingOwnPastes
                    ? "Your Pastes"
                    : userHandle
                      ? `${userHandle}'s Pastes`
                      : "Browse AT Protocol Pastes"}
                </Text>
              </XStack>
              <Text fontSize="$4">
                {isViewingOwnPastes
                  ? "Manage all your AT Protocol pastes"
                  : userHandle
                    ? `View pastes shared by @${userHandle}`
                    : "Discover and view pastes shared on the AT Protocol"}
              </Text>
            </YStack>

            {/* Only show create button when viewing your own pastes or when unauthenticated */}
            {(!isAuthenticated || isViewingOwnPastes) && (
              <XStack space="$3" flexWrap="wrap">
                {isAuthenticated ? (
                  <Link
                    to="/"
                    style={{ textDecoration: "none", flex: 1, minWidth: 120 }}
                  >
                    <Button theme="green" size="$4" width="100%">
                      <XStack alignItems="center" space="$2">
                        <SparklesIcon width={20} height={20} />
                        <Text>Create New Paste</Text>
                      </XStack>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    theme="green"
                    size="$4"
                    width="100%"
                    onPress={() => setIsAuthModalOpen(true)}
                  >
                    <XStack alignItems="center" space="$2">
                      <SparklesIcon width={20} height={20} />
                      <Text>Login to Create Paste</Text>
                    </XStack>
                  </Button>
                )}
              </XStack>
            )}

            {/* Pagination Controls */}
            <XStack space="$3" justifyContent="center" alignItems="center">
              <Button onPress={handlePrevPage} size="$4" theme="blue">
                Previous
              </Button>

              <Button
                onPress={handleNextPage}
                disabled={pastes.length < 20}
                size="$4"
                theme="blue"
              >
                Next
              </Button>
            </XStack>
          </YStack>

          <PasteList
            pastes={pastes}
            userHandle={session?.handle}
            currentUserSession={session}
          />
        </YStack>
      </View>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </YStack>
  );
}
