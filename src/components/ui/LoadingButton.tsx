import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton, type InsetButtonProps } from "./InsetButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import {
  getVariantStyles,
  type ColorVariant,
} from "../../utils/buttonVariants";

interface LoadingButtonProps extends Omit<InsetButtonProps, "icon"> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children?: ReactNode;
  colorVariant?: ColorVariant;
}

export function LoadingButton({
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  colorVariant = "default",
  ...props
}: LoadingButtonProps) {
  const variantStyles = getVariantStyles(colorVariant);

  return (
    <InsetButton disabled={disabled || loading} {...variantStyles} {...props}>
      <XStack alignItems="center" gap="$2">
        {loading ? (
          <ArrowPathIcon width={20} height={20} className="animate-spin" />
        ) : (
          icon
        )}
        {children && (
          <Paragraph
            fontWeight={props.fontWeight}
            color={variantStyles.color || props.color || "$color"}
          >
            {loading ? loadingText || "Loading..." : children}
          </Paragraph>
        )}
      </XStack>
    </InsetButton>
  );
}
