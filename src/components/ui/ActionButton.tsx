import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button, type ButtonProps } from "@tamagui/button";
import type { ReactNode } from "react";

interface ActionButtonProps extends Omit<ButtonProps, "icon"> {
  icon: ReactNode;
  children: ReactNode;
}

export function ActionButton({ icon, children, ...props }: ActionButtonProps) {
  return (
    <Button {...props}>
      <XStack alignItems="center" gap="$2">
        {icon}
        <Paragraph>{children}</Paragraph>
      </XStack>
    </Button>
  );
}
