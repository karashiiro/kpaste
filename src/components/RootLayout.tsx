import { useNavigation } from "react-router";
import { View, YStack, Text } from "tamagui";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Header } from "./Header";
import type { ReactNode } from "react";

interface RootLayoutProps {
  onLoginClick?: () => void;
  children: ReactNode;
}

export function RootLayout({ onLoginClick, children }: RootLayoutProps) {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <YStack flex={1} minHeight="100vh">
      <Header onLoginClick={onLoginClick} />

      {/* Global navigation pending indicator */}
      {isNavigating && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={999}
          backgroundColor="rgba(102, 126, 234, 0.95)"
          paddingVertical="$2"
          paddingHorizontal="$4"
        >
          <View
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <ArrowPathIcon
              width={16}
              height={16}
              color="white"
              className="animate-spin"
            />
            <Text color="white" fontSize="$3" fontWeight="500">
              Loading...
            </Text>
          </View>
        </View>
      )}

      <View flex={1} position="relative">
        {children}
      </View>
    </YStack>
  );
}
