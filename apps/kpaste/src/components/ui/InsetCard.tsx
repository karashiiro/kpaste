import { Card } from "@tamagui/card";
import type { CardProps } from "@tamagui/card";
import { getShadowStyle, type ShadowProps } from "../../utils/shadowUtils";

interface InsetCardProps extends CardProps, ShadowProps {
  /** Border radius for the outer button */
  outerRadius?: string | number;
  /** Border radius for the inner card */
  innerRadius?: string | number;
  /** Padding between button edge and card */
  insetPadding?: string | number;
  insetBorderColor?: string;
  /** Padding inside the card around content */
  cardPadding?: string | number;
}

export function InsetCard({
  children,
  outerRadius = "12px",
  innerRadius = "8px",
  insetPadding = "$2",
  insetBorderColor = "var(--borderColor)",
  cardPadding = "$2",
  shadow = true,
  ...cardProps
}: InsetCardProps) {
  return (
    <Card
      padding={insetPadding}
      borderRadius={outerRadius}
      backgroundColor="$insetCardBackground"
      style={{
        ...getShadowStyle(shadow),
      }}
      {...cardProps}
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
        padding={cardPadding}
        boxSizing="border-box"
      >
        {children}
      </Card>
    </Card>
  );
}
