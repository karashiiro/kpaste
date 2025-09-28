import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton, type InsetButtonProps } from "./InsetButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

type ColorVariant = "default" | "green" | "blue" | "red";

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
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (colorVariant) {
      case "green":
        return {
          backgroundColor: "$greenBase",
          color: "$greenText",
          hoverStyle: {
            backgroundColor: "$greenHover",
            borderColor: "transparent",
          },
          pressStyle: {
            backgroundColor: "$greenPress",
            borderColor: "transparent",
          },
        };
      case "blue":
        return {
          backgroundColor: "$blueBase",
          color: "$blueText",
          hoverStyle: {
            backgroundColor: "$blueHover",
            borderColor: "transparent",
          },
          pressStyle: {
            backgroundColor: "$bluePress",
            borderColor: "transparent",
          },
        };
      case "red":
        return {
          backgroundColor: "$redBase",
          color: "$redText",
          hoverStyle: {
            backgroundColor: "$redHover",
            borderColor: "transparent",
          },
          pressStyle: {
            backgroundColor: "$redPress",
            borderColor: "transparent",
          },
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <InsetButton disabled={disabled || loading} {...variantStyles} {...props}>
      <XStack alignItems="center" gap="$2">
        {loading ? (
          <ArrowPathIcon width={20} height={20} className="animate-spin" />
        ) : (
          icon
        )}
        {children && (
          <Paragraph color={variantStyles.color || props.color || "$color"}>
            {loading ? loadingText || "Loading..." : children}
          </Paragraph>
        )}
      </XStack>
    </InsetButton>
  );
}
