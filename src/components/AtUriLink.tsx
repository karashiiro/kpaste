import { Card, XStack, Text } from "tamagui";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getAtProtoViewerUrl } from "../utils/atproto";

export interface AtUriLinkProps {
  uri: string;
  showLabel?: boolean;
  variant?: "default" | "compact";
  fontSize?: "$2" | "$3" | "$4";
}

export function AtUriLink({
  uri,
  showLabel = true,
  variant = "default",
  fontSize = "$3",
}: AtUriLinkProps) {
  const handleClick = () => {
    window.open(getAtProtoViewerUrl(uri), "_blank");
  };

  if (variant === "compact") {
    return (
      <Card
        padding="$2"
        borderRadius="$4"
        pressStyle={{ backgroundColor: "$gray3" }}
        cursor="pointer"
        onPress={handleClick}
      >
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          <Text
            fontSize={fontSize}
            fontFamily="$mono"
            color="$blue10"
            flex={1}
            numberOfLines={1}
          >
            {uri}
          </Text>
          <ArrowTopRightOnSquareIcon width={14} height={14} color="#0066cc" />
        </XStack>
      </Card>
    );
  }

  return (
    <Card
      padding="$3"
      borderRadius="$4"
      pressStyle={{ backgroundColor: "$gray3" }}
      cursor="pointer"
      onPress={handleClick}
    >
      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <Text fontSize={fontSize} fontFamily="$mono" flex={1}>
          {showLabel && (
            <>
              <Text fontWeight="600">URI:</Text>{" "}
            </>
          )}
          <Text color="$blue10">{uri}</Text>
        </Text>
        <ArrowTopRightOnSquareIcon width={16} height={16} color="#0066cc" />
      </XStack>
    </Card>
  );
}
