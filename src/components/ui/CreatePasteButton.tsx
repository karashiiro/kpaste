import { ActionButton } from "./ActionButton";
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

  return (
    <Link
      to="/"
      style={{
        textDecoration: "none",
        ...(fullWidth && { width: "100%" }),
      }}
    >
      <ActionButton
        colorVariant="yellow"
        size="$3"
        fontWeight="700"
        {...(fullWidth && { width: "100%" })}
        icon={
          isNavigatingToHome ? (
            <ArrowPathIcon width={20} height={20} className="animate-spin" />
          ) : (
            <SparklesIcon width={20} height={20} color="var(--yellowText)" />
          )
        }
      >
        Create Paste
      </ActionButton>
    </Link>
  );
}
