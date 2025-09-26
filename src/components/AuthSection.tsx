import { XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { Paragraph } from "@tamagui/text";
import { Link, useNavigation } from "react-router";
import {
  RocketLaunchIcon,
  HandRaisedIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { AuthSession } from "../auth/types";

interface AuthSectionProps {
  isAuthenticated: boolean;
  session: AuthSession | null;
  onLoginClick?: () => void;
  onLogout: () => void;
  fullWidth?: boolean;
}

export function AuthSection({
  isAuthenticated,
  session,
  onLoginClick,
  onLogout,
  fullWidth = false,
}: AuthSectionProps) {
  const navigation = useNavigation();

  if (!isAuthenticated) {
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
        {...(fullWidth && { width: "100%" })}
      >
        <XStack alignItems="center" gap="$2">
          <RocketLaunchIcon width={20} height={20} color="white" />
          <Paragraph color="white">Login</Paragraph>
        </XStack>
      </Button>
    );
  }

  return (
    <XStack
      alignItems="center"
      gap="$3"
      justifyContent={fullWidth ? "center" : "flex-start"}
      width={fullWidth ? "100%" : "auto"}
    >
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
          <Paragraph fontSize="$4" color="white" fontWeight="600">
            @{session?.handle}
          </Paragraph>
        </XStack>
      </Link>
      <Button
        onPress={onLogout}
        backgroundColor="rgba(255, 255, 255, 0.1)"
        borderColor="rgba(255, 255, 255, 0.2)"
        borderWidth={1}
        color="white"
        size="$3"
        borderRadius="$8"
      >
        <XStack alignItems="center" gap="$2">
          <HandRaisedIcon width={16} height={16} color="white" />
          <Paragraph color="white">Logout</Paragraph>
        </XStack>
      </Button>
    </XStack>
  );
}
