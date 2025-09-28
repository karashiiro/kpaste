import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton } from "./InsetButton";
import { Link, useNavigation } from "react-router";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface CreatePasteButtonProps {
  fullWidth?: boolean;
}

export function CreatePasteButton({
  fullWidth = false,
}: CreatePasteButtonProps) {
  const navigation = useNavigation();
  const isNavigatingToHome = navigation.location?.pathname === "/";

  const buttonProps = {
    backgroundColor: "$yellow9" as const,
    size: "$3" as const,
    fontWeight: "700" as const,
    hoverStyle: {
      backgroundColor: "$yellow10",
      outlineWidth: 0,
      borderColor: "transparent",
    },
    pressStyle: {
      backgroundColor: "$yellow8",
      outlineWidth: 0,
      borderColor: "transparent",
    },
    ...(fullWidth && { width: "100%" }),
  };

  return (
    <Link
      to="/"
      style={{
        textDecoration: "none",
        ...(fullWidth && { width: "100%" }),
      }}
    >
      <InsetButton {...buttonProps}>
        <XStack alignItems="center" gap="$2">
          <Paragraph fontWeight="700" color="$accentText">
            Create Paste
          </Paragraph>
          {isNavigatingToHome ? (
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
          ) : (
            <SparklesIcon width={20} height={20} color="$accentText" />
          )}
        </XStack>
      </InsetButton>
    </Link>
  );
}
