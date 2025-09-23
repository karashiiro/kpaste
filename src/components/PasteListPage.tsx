import { YStack, View, XStack, Text, Button } from "tamagui";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { PasteList } from "./PasteList";
import { AuthModal } from "./AuthModal";
import { Header } from "./Header";
import { AuthRequiredView } from "./AuthRequiredView";
import type { PasteListLoaderData } from "../loaders/pasteListLoader";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export function PasteListPage() {
  const { isAuthenticated, session, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { pastes, nextCursor, prevCursor } =
    useLoaderData() as PasteListLoaderData;

  const [, setSearchParams] = useSearchParams();

  const handleNextPage = () => {
    if (nextCursor) {
      setSearchParams({ cursor: nextCursor });
    }
  };

  const handlePrevPage = () => {
    if (prevCursor) {
      setSearchParams({ cursor: prevCursor });
    }
  };

  if (!isAuthenticated) {
    return (
      <YStack minHeight="100vh" backgroundColor="$background">
        <Header
          variant="unauthenticated"
          onLoginClick={() => setIsAuthModalOpen(true)}
        />

        <AuthRequiredView
          title="Browse AT Protocol Pastes 📚"
          subtitle="Please log in to view and manage your pastes."
          buttonText="🚀 Login to Browse"
          onLoginClick={() => setIsAuthModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </YStack>
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <Header
        variant="authenticated"
        userHandle={session?.handle}
        onLogoutClick={logout}
        showCreateLink={true}
      />

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
              <Text fontSize="$8" fontWeight="700">
                📚 Your Pastes
              </Text>
              <Text fontSize="$4">Manage all your AT Protocol pastes</Text>
            </YStack>

            <XStack space="$3" flexWrap="wrap">
              <Link
                to="/"
                style={{ textDecoration: "none", flex: 1, minWidth: 120 }}
              >
                <Button theme="green" size="$4" width="100%">
                  ✨ Create New Paste
                </Button>
              </Link>
            </XStack>

            {/* Pagination Controls */}
            <XStack space="$3" justifyContent="center" alignItems="center">
              <Button
                onPress={handlePrevPage}
                disabled={!prevCursor}
                size="$4"
                theme="blue"
              >
                Previous
              </Button>

              <Button
                onPress={handleNextPage}
                disabled={!nextCursor}
                size="$4"
                theme="blue"
              >
                Next
              </Button>
            </XStack>
          </YStack>

          <PasteList pastes={pastes} userHandle={session?.handle} />
        </YStack>
      </View>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </YStack>
  );
}
