import { Paragraph } from "@tamagui/text";
import { Tooltip } from "@tamagui/tooltip";
import { LoadingButton, type LoadingButtonProps } from "./LoadingButton";

interface InsetCircleButtonProps extends LoadingButtonProps {
  onPress: () => void;
  loading?: boolean;
  icon: React.ReactNode;
  tooltipText: string;
}

export function InsetCircleButton({
  onPress,
  loading,
  icon,
  tooltipText,
  ...props
}: InsetCircleButtonProps) {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <LoadingButton
          size="$4"
          circular
          outerRadius="50%"
          innerRadius="50%"
          paddingHorizontal="3px"
          paddingVertical="3px"
          flex={0}
          flexShrink={0}
          flexGrow={0}
          cardPadding={0}
          onPress={onPress}
          loading={loading}
          opacity={0.8}
          icon={icon}
          {...props}
        ></LoadingButton>
      </Tooltip.Trigger>
      <Tooltip.Content
        enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        opacity={1}
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Tooltip.Arrow />
        <Paragraph>{tooltipText}</Paragraph>
      </Tooltip.Content>
    </Tooltip>
  );
}
