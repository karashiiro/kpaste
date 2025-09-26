import { XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { Paragraph } from "@tamagui/text";
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
    borderColor: "rgba(165, 132, 49, 1)",
    borderWidth: 1,
    size: "$3" as const,
    borderRadius: "$10" as const,
    fontWeight: "700" as const,
    hoverStyle: {
      backgroundColor: "$yellow10",
    },
    pressStyle: {
      backgroundColor: "$yellow8",
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
      <Button {...buttonProps}>
        <XStack alignItems="center" gap="$2">
          <Paragraph fontWeight="700" color="rgba(83, 65, 22, 1)">
            Create Paste
          </Paragraph>
          {isNavigatingToHome ? (
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
          ) : (
            <SparklesIcon width={20} height={20} color="rgba(83, 65, 22, 1)" />
          )}
        </XStack>
      </Button>
    </Link>
  );
}
