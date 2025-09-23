import { XStack, Text, Button, View } from "tamagui";
import { Link } from "react-router";
import {
  SparklesIcon,
  RocketLaunchIcon,
  HandRaisedIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export interface HeaderProps {
  variant: "authenticated" | "unauthenticated" | "simple" | "account";
  userHandle?: string;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onAccountClick?: () => void;
  showCreateLink?: boolean;
}

export function Header({
  variant,
  userHandle,
  onLoginClick,
  onLogoutClick,
  onAccountClick,
  showCreateLink = true,
}: HeaderProps) {
  const renderLeftContent = () => {
    if (variant === "authenticated" && showCreateLink) {
      return (
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
    }

    if (variant === "simple" && showCreateLink) {
      return (
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
    }

    if (variant === "authenticated" && userHandle) {
      return (
        <Link
          to={`/pastes/${userHandle}`}
          style={{ textDecoration: "underline" }}
        >
          <Text color="white">@{userHandle}</Text>
        </Link>
      );
    }

    if (variant === "account" && userHandle) {
      return (
        <Link
          to={`/pastes/${userHandle}`}
          style={{ textDecoration: "underline" }}
        >
          <Text color="white">@{userHandle}</Text>
        </Link>
      );
    }

    return <View />;
  };

  const renderRightContent = () => {
    if (variant === "unauthenticated" && onLoginClick) {
      return (
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
      );
    }

    if (variant === "authenticated" && userHandle && onLogoutClick) {
      return (
        <XStack alignItems="center" space="$3">
          <Link
            to={`/pastes/${userHandle}`}
            style={{ textDecoration: "underline" }}
          >
            <Text fontSize="$4" color="white" fontWeight="600">
              @{userHandle}
            </Text>
          </Link>
          <Button
            onPress={onLogoutClick}
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
    }

    if (variant === "account" && onAccountClick) {
      return (
        <Button
          onPress={onAccountClick}
          backgroundColor="rgba(255, 255, 255, 0.1)"
          borderColor="rgba(255, 255, 255, 0.2)"
          borderWidth={1}
          color="white"
          size="$4"
          borderRadius="$10"
        >
          <XStack alignItems="center" space="$2">
            <HandRaisedIcon width={20} height={20} color="white" />
            <Text color="white">Account</Text>
          </XStack>
        </Button>
      );
    }

    return <View />;
  };

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
      >
        {renderLeftContent()}

        <XStack alignItems="center" space="$2">
          <DocumentTextIcon width={32} height={32} color="white" />
          <Text fontSize="$7" fontWeight="700" color="white">
            KPaste
          </Text>
        </XStack>

        {renderRightContent()}
      </XStack>
    </View>
  );
}
