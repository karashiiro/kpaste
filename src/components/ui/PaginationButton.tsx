import { InsetButton, type InsetButtonProps } from "./InsetButton";
import type { ReactNode } from "react";

type ColorVariant = "default" | "blue" | "green";

interface PaginationButtonProps extends InsetButtonProps {
  children: ReactNode;
  colorVariant?: ColorVariant;
}

export function PaginationButton({
  children,
  colorVariant = "default",
  ...props
}: PaginationButtonProps) {
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (colorVariant) {
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
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <InsetButton {...variantStyles} {...props}>
      {children}
    </InsetButton>
  );
}
