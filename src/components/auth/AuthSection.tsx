import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton } from "../ui/InsetButton";
import { Link } from "react-router";
import { RocketLaunchIcon, HandRaisedIcon } from "@heroicons/react/24/outline";
import type { AuthSession } from "../../auth/types";

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
  if (!isAuthenticated) {
    return (
      <InsetButton
        onPress={onLoginClick}
        backgroundColor="$overlay"
        color="white"
        size="$4"
        {...(fullWidth && { width: "100%" })}
      >
        <XStack alignItems="center" gap="$2">
          <RocketLaunchIcon width={20} height={20} color="white" />
          <Paragraph fontWeight="600" color="white">
            Login
          </Paragraph>
        </XStack>
      </InsetButton>
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
        <Paragraph fontSize="$4" color="white" fontWeight="600">
          @{session?.handle}
        </Paragraph>
      </Link>
      <InsetButton
        onPress={onLogout}
        backgroundColor="$overlay"
        color="white"
        size="$3"
      >
        <XStack alignItems="center" gap="$2">
          <HandRaisedIcon width={16} height={16} color="white" />
          <Paragraph fontWeight="600" color="white">
            Logout
          </Paragraph>
        </XStack>
      </InsetButton>
    </XStack>
  );
}
