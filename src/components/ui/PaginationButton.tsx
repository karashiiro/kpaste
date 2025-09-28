import { InsetButton, type InsetButtonProps } from "./InsetButton";
import type { ReactNode } from "react";
import {
  getVariantStyles,
  type ColorVariant,
} from "../../utils/buttonVariants";

interface PaginationButtonProps extends InsetButtonProps {
  children: ReactNode;
  colorVariant?: ColorVariant;
}

export function PaginationButton({
  children,
  colorVariant = "default",
  ...props
}: PaginationButtonProps) {
  const variantStyles = getVariantStyles(colorVariant);

  return (
    <InsetButton {...variantStyles} {...props}>
      {children}
    </InsetButton>
  );
}
