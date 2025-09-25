import { Button, XStack, Text, type ButtonProps } from "tamagui";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

interface LoadingButtonProps extends Omit<ButtonProps, "icon"> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      <XStack alignItems="center" gap="$2">
        {loading ? (
          <ArrowPathIcon width={20} height={20} className="animate-spin" />
        ) : (
          icon
        )}
        {children && (
          <Text>{loading ? loadingText || "Loading..." : children}</Text>
        )}
      </XStack>
    </Button>
  );
}
