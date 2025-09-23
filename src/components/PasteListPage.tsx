import { YStack, View, XStack, Text, Button } from "tamagui";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { PasteList } from "./PasteList";
import { AuthModal } from "./AuthModal";
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
        {/* Compact Header */}
        <View
          background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          paddingVertical="$4"
          paddingHorizontal="$6"
        >
          <XStack
            maxWidth={1200}
            marginHorizontal="auto"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Link
              to="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ✨ Create Paste
            </Link>

            <Text fontSize="$7" fontWeight="700" color="white">
              📝 KPaste
            </Text>

            <Button
              onPress={() => setIsAuthModalOpen(true)}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth={2}
              color="white"
              fontWeight="600"
              size="$4"
              borderRadius="$10"
            >
              🚀 Login
            </Button>
          </XStack>
        </View>

        {/* Login Required Message */}
        <View flex={1} justifyContent="center" alignItems="center" padding="$6">
          <YStack space="$4" alignItems="center" maxWidth={400}>
            <Text fontSize="$8" fontWeight="700" textAlign="center">
              Browse AT Protocol Pastes 📚
            </Text>
            <Text fontSize="$5" textAlign="center">
              Please log in to view and manage your pastes.
            </Text>
            <Button
              onPress={() => setIsAuthModalOpen(true)}
              theme="green"
              size="$5"
              marginTop="$2"
            >
              🚀 Login to Browse
            </Button>
          </YStack>
        </View>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </YStack>
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      {/* Compact Header */}
      <View
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        paddingVertical="$4"
        paddingHorizontal="$6"
      >
        <XStack
          maxWidth={1200}
          marginHorizontal="auto"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ✨ Create Paste
          </Link>

          <Text fontSize="$7" fontWeight="700" color="white">
            📝 KPaste
          </Text>

          <XStack alignItems="center" space="$3">
            <Text fontSize="$4" color="white" fontWeight="600">
              <Link
                to={`/pastes/${session?.handle}`}
                style={{ color: "white", textDecoration: "underline" }}
              >
                @{session?.handle}
              </Link>
            </Text>
            <Button
              onPress={logout}
              backgroundColor="rgba(255, 255, 255, 0.1)"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderWidth={1}
              color="white"
              size="$3"
              borderRadius="$8"
            >
              👋 Logout
            </Button>
          </XStack>
        </XStack>
      </View>

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
