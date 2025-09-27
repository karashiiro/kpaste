import { XStack } from "@tamagui/stacks";
import { Button, type ButtonProps } from "@tamagui/button";
import { Paragraph } from "@tamagui/text";
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
          <Paragraph>
            {loading ? loadingText || "Loading..." : children}
          </Paragraph>
        )}
      </XStack>
    </Button>
  );
}
