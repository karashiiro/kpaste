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
  const viewerUrl = getAtProtoViewerUrl(uri);

  if (variant === "compact") {
    return (
      <a
        href={viewerUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        <Card
          padding="$2"
          borderRadius="$4"
          hoverStyle={{ backgroundColor: "$gray3" }}
          cursor="pointer"
        >
          <XStack alignItems="center" gap="$2" justifyContent="space-between">
            <Text
              fontSize={fontSize}
              fontFamily={'"Inconsolata", monospace'}
              fontWeight="600"
              color="$blue10"
              flex={1}
              numberOfLines={1}
            >
              {uri}
            </Text>
            <ArrowTopRightOnSquareIcon width={14} height={14} color="#0066cc" />
          </XStack>
        </Card>
      </a>
    );
  }

  return (
    <a
      href={viewerUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      <Card
        padding="$3"
        borderRadius="$4"
        hoverStyle={{ backgroundColor: "$gray3" }}
        cursor="pointer"
      >
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          {showLabel && (
            <>
              <Text fontWeight="600">URI:</Text>{" "}
            </>
          )}
          <Text
            fontSize={fontSize}
            fontFamily={'"Inconsolata", monospace'}
            color="$blue10"
            flex={1}
          >
            {uri}
          </Text>
          <ArrowTopRightOnSquareIcon width={16} height={16} color="#0066cc" />
        </XStack>
      </Card>
    </a>
  );
}
