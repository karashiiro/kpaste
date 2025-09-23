import { XStack, YStack, Text, Button, View, Image } from "tamagui";
import { Link } from "react-router";
import {
  SparklesIcon,
  RocketLaunchIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

export interface HeaderProps {
  onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { isAuthenticated, session, logout } = useAuth();

  const leftContent = (
    <Link
      to="/"
      style={{
        textDecoration: "none",
      }}
    >
      <XStack alignItems="center" space="$2">
        <SparklesIcon width={20} height={20} color="white" />
        <Text color="white" fontWeight="600">
          Create Paste
        </Text>
      </XStack>
    </Link>
  );

  const rightContent = !isAuthenticated ? (
    <Button
      onPress={onLoginClick}
      backgroundColor="rgba(255, 255, 255, 0.2)"
      borderColor="rgba(255, 255, 255, 0.3)"
      borderWidth={2}
      color="white"
      fontWeight="600"
      size="$4"
      borderRadius="$10"
    >
      <XStack alignItems="center" space="$2">
        <RocketLaunchIcon width={20} height={20} color="white" />
        <Text color="white">Login</Text>
      </XStack>
    </Button>
  ) : (
    <XStack alignItems="center" space="$3">
      <Link
        to={`/pastes/${session?.handle}`}
        style={{ textDecoration: "underline" }}
      >
        <Text fontSize="$4" color="white" fontWeight="600">
          @{session?.handle}
        </Text>
      </Link>
      <Button
        onPress={logout}
        backgroundColor="rgba(255, 255, 255, 0.1)"
        borderColor="rgba(255, 255, 255, 0.2)"
        borderWidth={1}
        color="white"
        size="$3"
        borderRadius="$8"
      >
        <XStack alignItems="center" space="$2">
          <HandRaisedIcon width={16} height={16} color="white" />
          <Text color="white">Logout</Text>
        </XStack>
      </Button>
    </XStack>
  );

  return (
    <View
      background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      paddingVertical="$4"
      paddingHorizontal="$6"
    >
      {/* Desktop layout: horizontal with centered logo */}
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
        {leftContent}

        {/* Absolutely centered logo */}
        <View
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
        >
          <Image source={{ width: 125, height: 50, uri: "/kpaste.webp" }} />
        </View>

        {/* Spacer to maintain layout balance */}
        <View width={125} />

        {rightContent}
      </XStack>

      {/* Mobile layout: stacked vertically */}
      <YStack
        alignItems="center"
        space="$3"
        display="flex"
        $sm={{
          display: "none",
        }}
      >
        {/* Logo first */}
        <Image source={{ width: 125, height: 50, uri: "/kpaste.webp" }} />

        {/* Navigation below logo */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          maxWidth={400}
        >
          {leftContent}
          {rightContent}
        </XStack>
      </YStack>
    </View>
  );
}
