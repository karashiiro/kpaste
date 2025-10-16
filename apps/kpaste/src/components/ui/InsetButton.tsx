import { Button } from "@tamagui/button";
import type { ButtonProps } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { getShadowStyle, type ShadowProps } from "../../utils/shadowUtils";
import {
  getVariantStyles,
  type ColorVariant,
} from "../../utils/buttonVariants";

export interface InsetButtonProps extends ButtonProps, ShadowProps {
  /** Border radius for the outer button */
  outerRadius?: string | number;
  /** Border radius for the inner card */
  innerRadius?: string | number;
  /** Padding between button edge and card */
  insetPadding?: string | number;
  insetBorderColor?: string;
  /** Padding inside the card around content */
  cardPadding?: string | number;
  colorVariant?: ColorVariant;
}

export function InsetButton({
  children,
  outerRadius = "12px",
  innerRadius = "8px",
  insetPadding = "$2",
  insetBorderColor = "var(--borderColor)",
  cardPadding = "$2",
  shadow = true,
  colorVariant = "default",
  ...buttonProps
}: InsetButtonProps) {
  const variantStyles = getVariantStyles(colorVariant);

  return (
    <Button
      padding={insetPadding}
      borderRadius={outerRadius}
      height={50}
      style={buttonProps.style || getShadowStyle(shadow)}
      focusStyle={{
        outlineWidth: 0,
        borderColor: "transparent",
      }}
      hoverStyle={{
        outlineWidth: 0,
        borderColor: "transparent",
      }}
      pressStyle={{
        outlineWidth: 0,
        borderColor: "transparent",
      }}
      {...variantStyles}
      {...buttonProps}
    >
      <Card
        unstyled
        borderStyle="dashed"
        borderWidth={2}
        borderColor={insetBorderColor}
        borderRadius={innerRadius}
        backgroundColor="transparent"
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        padding={cardPadding}
        boxSizing="border-box"
      >
        {children}
      </Card>
    </Button>
  );
}
