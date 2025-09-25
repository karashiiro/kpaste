import { XStack, YStack, Text, Button, View, Image } from "tamagui";
import { Link, useNavigation } from "react-router";
import {
  SparklesIcon,
  RocketLaunchIcon,
  HandRaisedIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

export interface HeaderProps {
  onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { isAuthenticated, session, logout } = useAuth();
  const navigation = useNavigation();

  // Check if we're navigating to the home page
  const isNavigatingToHome = navigation.location?.pathname === "/";

  const leftContent = (
    <Link
      to="/"
      style={{
        textDecoration: "none",
      }}
    >
      <Button
        backgroundColor="$yellow9"
        borderColor="rgba(165, 132, 49, 1)"
        borderWidth={1}
        size="$3"
        borderRadius="$10"
        fontWeight="700"
        hoverStyle={{
          backgroundColor: "$yellow10",
        }}
        pressStyle={{
          backgroundColor: "$yellow8",
        }}
      >
        <XStack alignItems="center" gap="$2">
          <Text fontWeight="700" color="rgba(83, 65, 22, 1)">
            Create Paste
          </Text>
          {isNavigatingToHome ? (
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
          ) : (
            <SparklesIcon width={20} height={20} color="rgba(83, 65, 22, 1)" />
          )}
        </XStack>
      </Button>
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
      <XStack alignItems="center" gap="$2">
        <RocketLaunchIcon width={20} height={20} color="white" />
        <Text color="white">Login</Text>
      </XStack>
    </Button>
  ) : (
    <XStack alignItems="center" gap="$3">
      <Link
        to={`/pastes/${session?.handle}`}
        style={{ textDecoration: "none" }}
      >
        <XStack alignItems="center" gap="$2">
          {navigation.location?.pathname === `/pastes/${session?.handle}` && (
            <ArrowPathIcon
              width={16}
              height={16}
              color="white"
              className="animate-spin"
            />
          )}
          <Text fontSize="$4" color="white" fontWeight="600">
            @{session?.handle}
          </Text>
        </XStack>
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
        <XStack alignItems="center" gap="$2">
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

        <View
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
        >
          <Link to="/">
            <Image source={{ width: 125, height: 50, uri: "/kpaste.webp" }} />
          </Link>
        </View>

        <View width={125} />

        {rightContent}
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
        <Link to="/">
          <Image source={{ width: 125, height: 50, uri: "/kpaste.webp" }} />
        </Link>

        {/* Mobile Create Paste button - full width */}
        <View width="100%" maxWidth={320}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              width: "100%",
            }}
          >
            <Button
              backgroundColor="$yellow9"
              borderColor="rgba(165, 132, 49, 1)"
              borderWidth={1}
              size="$3"
              borderRadius="$10"
              fontWeight="700"
              width="100%"
              hoverStyle={{
                backgroundColor: "$yellow10",
              }}
              pressStyle={{
                backgroundColor: "$yellow8",
              }}
            >
              <XStack alignItems="center" gap="$2">
                <Text fontWeight="700" color="rgba(83, 65, 22, 1)">
                  Create Paste
                </Text>
                {isNavigatingToHome ? (
                  <ArrowPathIcon
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                ) : (
                  <SparklesIcon
                    width={20}
                    height={20}
                    color="rgba(83, 65, 22, 1)"
                  />
                )}
              </XStack>
            </Button>
          </Link>
        </View>

        {/* Mobile auth section */}
        {!isAuthenticated ? (
          <View width="100%" maxWidth={320}>
            <Button
              onPress={onLoginClick}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth={2}
              color="white"
              fontWeight="600"
              size="$4"
              borderRadius="$10"
              width="100%"
            >
              <XStack alignItems="center" gap="$2">
                <RocketLaunchIcon width={20} height={20} color="white" />
                <Text color="white">Login</Text>
              </XStack>
            </Button>
          </View>
        ) : (
          <XStack alignItems="center" gap="$3">
            <Link
              to={`/pastes/${session?.handle}`}
              style={{ textDecoration: "none" }}
            >
              <XStack alignItems="center" gap="$2">
                {navigation.location?.pathname ===
                  `/pastes/${session?.handle}` && (
                  <ArrowPathIcon
                    width={16}
                    height={16}
                    color="white"
                    className="animate-spin"
                  />
                )}
                <Text fontSize="$4" color="white" fontWeight="600">
                  @{session?.handle}
                </Text>
              </XStack>
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
              <XStack alignItems="center" gap="$2">
                <HandRaisedIcon width={16} height={16} color="white" />
                <Text color="white">Logout</Text>
              </XStack>
            </Button>
          </XStack>
        )}
      </YStack>
    </View>
  );
}
