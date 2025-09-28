import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton, type InsetButtonProps } from "./InsetButton";
import type { ReactNode } from "react";
import {
  getVariantStyles,
  type ColorVariant,
} from "../../utils/buttonVariants";

interface ActionButtonProps extends InsetButtonProps {
  children: ReactNode;
  colorVariant?: ColorVariant;
}

export function ActionButton({
  icon,
  children,
  colorVariant = "default",
  ...props
}: ActionButtonProps) {
  const variantStyles = getVariantStyles(colorVariant);

  return (
    <InsetButton {...variantStyles} {...props}>
      <XStack alignItems="center" gap="$2">
        {icon}
        <Paragraph color={variantStyles.color || props.color || "$color"}>
          {children}
        </Paragraph>
      </XStack>
    </InsetButton>
  );
}
