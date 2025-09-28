import { Button } from "@tamagui/button";
import type { ButtonProps } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { getShadowStyle, type ShadowProps } from "../../utils/shadowUtils";

export interface InsetButtonProps extends ButtonProps, ShadowProps {
  /** Border radius for the outer button */
  outerRadius?: string | number;
  /** Border radius for the inner card */
  innerRadius?: string | number;
  /** Horizontal padding between button edge and card */
  paddingHorizontal?: string | number;
  /** Vertical padding between button edge and card */
  paddingVertical?: string | number;
  /** Padding inside the card around content */
  cardPadding?: string | number;
}

export function InsetButton({
  children,
  outerRadius = "12px",
  innerRadius = "8px",
  paddingHorizontal = "6px",
  paddingVertical = "6px",
  cardPadding = "$2",
  shadow = true,
  ...buttonProps
}: InsetButtonProps) {
  return (
    <Button
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      borderRadius={outerRadius}
      minHeight="auto"
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
      {...buttonProps}
    >
      <Card
        unstyled
        borderStyle="dashed"
        borderWidth={2}
        borderColor="$borderColor"
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
