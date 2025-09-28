import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetButton, type InsetButtonProps } from "./InsetButton";
import type { ReactNode } from "react";

interface ActionButtonProps extends InsetButtonProps {
  children: ReactNode;
}

export function ActionButton({ icon, children, ...props }: ActionButtonProps) {
  return (
    <InsetButton {...props}>
      <XStack alignItems="center" gap="$2">
        {icon}
        <Paragraph>{children}</Paragraph>
      </XStack>
    </InsetButton>
  );
}
