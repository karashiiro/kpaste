import { XStack, YStack } from "@tamagui/stacks";
import { View } from "@tamagui/core";
import { useAuth } from "../../hooks/useAuth";
import { HeaderLogo } from "./HeaderLogo";
import { CreatePasteButton } from "../ui/CreatePasteButton";
import { AuthSection } from "../auth/AuthSection";
import { Card } from "@tamagui/card";
import { getShadowStyle } from "../../utils/shadowUtils";

export interface HeaderProps {
  onLoginClick?: () => void;
  isNavigating?: boolean;
}

export function Header({ onLoginClick, isNavigating }: HeaderProps) {
  const { isAuthenticated, session, logout } = useAuth();

  return (
    <View background="$primary" zIndex={1} style={getShadowStyle(true)}>
      <Card unstyled paddingVertical="$4" paddingHorizontal="$5">
        {/* Desktop layout: horizontal */}
        <XStack
          maxWidth={1200}
          marginHorizontal="auto"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          position="relative"
          display="none"
          $sm={{
            display: "flex",
          }}
        >
          <CreatePasteButton />

          <View
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={1}
          >
            <HeaderLogo />
          </View>

          <View width={125} />

          <AuthSection
            isAuthenticated={isAuthenticated}
            session={session || null}
            onLoginClick={onLoginClick}
            onLogout={logout}
          />
        </XStack>

        {/* Mobile layout: stacked vertically */}
        <YStack
          alignItems="center"
          gap="$3"
          display="flex"
          $sm={{
            display: "none",
          }}
        >
          <HeaderLogo />

          {/* Mobile Create Paste button - full width */}
          <View width="100%" maxWidth={320}>
            <CreatePasteButton fullWidth />
          </View>

          {/* Mobile auth section */}
          <View width="100%" maxWidth={320}>
            <AuthSection
              isAuthenticated={isAuthenticated}
              session={session || null}
              onLoginClick={onLoginClick}
              onLogout={logout}
              fullWidth
            />
          </View>
        </YStack>
      </Card>
      {!isNavigating && (
        <>
          <Card
            unstyled
            borderBottomColor="$borderColor"
            borderBottomWidth={2}
            borderStyle="dashed"
          />
          <div style={{ height: 8 }} />
        </>
      )}
    </View>
  );
}
