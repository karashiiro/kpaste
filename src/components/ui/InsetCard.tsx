import { Card } from "@tamagui/card";
import type { CardProps } from "@tamagui/card";
import { getShadowStyle, type ShadowProps } from "../../utils/shadowUtils";

interface InsetCardProps extends CardProps, ShadowProps {
  /** Padding around the card for the inset effect */
  insetPadding?: string;
}

export function InsetCard({
  children,
  insetPadding = "$2",
  shadow = true,
  ...cardProps
}: InsetCardProps) {
  return (
    <Card
      padding={insetPadding}
      borderRadius="$insetCardBorderRadius"
      backgroundColor="$insetCardBackground"
      style={{
        ...getShadowStyle(shadow),
      }}
      {...cardProps}
    >
      <div
        style={{
          borderStyle: "dashed",
          borderWidth: "var(--insetCardBorderWidth, 2px)",
          borderColor: "var(--insetCardBorderColor, var(--color4))",
          borderRadius: "var(--insetCardInnerRadius, 8px)",
          backgroundColor: "transparent",
          margin: insetPadding || "8px",
          boxSizing: "border-box",
          padding: "0.75rem",
        }}
      >
        {children}
      </div>
    </Card>
  );
}
