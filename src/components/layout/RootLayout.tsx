import { useNavigation } from "react-router";
import { View } from "@tamagui/core";
import { YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Header } from "./Header";
import type { ReactNode } from "react";
import { Card } from "@tamagui/card";
import { getShadowStyle } from "../../utils/shadowUtils";

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
        <Card
          unstyled
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={999}
          borderRadius={0}
          backgroundColor="$accentOverlay"
          style={getShadowStyle(true)}
        >
          <View paddingVertical="$1" paddingHorizontal="$4">
            <View
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              <ArrowPathIcon
                width={16}
                height={16}
                color="var(--accentText)"
                className="animate-spin"
              />
              <Paragraph color="$accentText" fontSize="$3" fontWeight="500">
                Loading...
              </Paragraph>
            </View>
          </View>

          <Card
            unstyled
            borderBottomColor="$accentText"
            borderBottomWidth={2}
            borderStyle="dashed"
          />
          <div style={{ height: 8 }} />
        </Card>
      )}

      <View flex={1} position="relative">
        {children}
      </View>
    </YStack>
  );
}
