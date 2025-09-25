import { Button, XStack, Text, type ButtonProps } from "tamagui";
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
        <Text>{children}</Text>
      </XStack>
    </Button>
  );
}
