import { Card } from "@tamagui/card";
import type { CardProps } from "@tamagui/card";
import { getShadowStyle, type ShadowProps } from "../../utils/shadowUtils";

interface InsetCardProps extends CardProps, ShadowProps {
  /** Padding around the card for the inset effect */
  insetPadding?: string;
  /** Theme for the card and background matching */
  theme?: "red" | "blue" | "green" | undefined;
}

export function InsetCard({
  children,
  insetPadding = "8px",
  theme,
  shadow = true,
  ...cardProps
}: InsetCardProps) {
  // Map theme to CSS variable for background color
  const getBackgroundColor = () => {
    switch (theme) {
      case "red":
        return "var(--red2)";
      case "blue":
        return "var(--blue2)";
      case "green":
        return "var(--green2)";
      default:
        return "var(--color2)";
    }
  };

  return (
    <div
      style={{
        padding: insetPadding,
        backgroundColor: getBackgroundColor(),
        borderRadius: "12px",
        ...getShadowStyle(shadow),
      }}
    >
      <Card
        borderStyle="dashed"
        borderWidth={2}
        borderColor="$borderColor"
        borderRadius="8px"
        theme={theme}
        {...cardProps}
      >
        {children}
      </Card>
    </div>
  );
}
