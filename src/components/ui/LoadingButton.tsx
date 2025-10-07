import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton, type InsetButtonProps } from "./InsetButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import {
  getCssColor,
  getVariantStyles,
  type ColorVariant,
} from "../../utils/buttonVariants";

export interface LoadingButtonProps extends Omit<InsetButtonProps, "icon"> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconSize?: {
    width: number;
    height: number;
  };
  iconComponent?: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  children?: ReactNode;
  colorVariant?: ColorVariant;
}

export function LoadingButton({
  loading = false,
  loadingText,
  icon,
  iconSize = { width: 20, height: 20 },
  children,
  disabled,
  colorVariant = "default",
  ...props
}: LoadingButtonProps) {
  const variantStyles = getVariantStyles(colorVariant);
  const iconColor = getCssColor(props.color || variantStyles.color);
  const iconWidth = iconSize.width;
  const iconHeight = iconSize.height;
  const iconResolved =
    icon ||
    (props.iconComponent ? (
      <props.iconComponent
        width={iconWidth}
        height={iconHeight}
        color={iconColor}
      />
    ) : null);

  return (
    <InsetButton
      disabled={disabled || loading}
      colorVariant={colorVariant}
      {...props}
    >
      <XStack alignItems="center" gap="$2">
        {loading ? (
          <ArrowPathIcon
            width={iconWidth}
            height={iconHeight}
            className="animate-spin"
            color={iconColor}
          />
        ) : (
          iconResolved
        )}
        {children && (
          <Paragraph
            fontWeight={props.fontWeight || "500"}
            color={props.color || variantStyles.color}
          >
            {loading ? loadingText || "Loading..." : children}
          </Paragraph>
        )}
      </XStack>
    </InsetButton>
  );
}
