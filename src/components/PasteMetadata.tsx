import { XStack, Text } from "tamagui";
import { Link } from "react-router";
import type { PasteRecord } from "../types";

interface PasteMetadataProps {
  paste: PasteRecord;
  handle: string;
  showSeparators?: boolean;
  responsive?: boolean;
  variant?: "inline" | "stacked";
}

export function PasteMetadata({
  paste,
  handle,
  showSeparators = true,
  responsive = true,
  variant = "inline",
}: PasteMetadataProps) {
  const Separator = () =>
    showSeparators ? (
      <Text fontSize="$4" display="none" $sm={{ display: "flex" }}>
        •
      </Text>
    ) : null;

  const containerProps =
    responsive && variant === "inline"
      ? {
          flexDirection: "column" as const,
          alignItems: "center" as const,
          gap: "$2",
          flexWrap: "wrap" as const,
          $xs: {
            flexDirection: "row" as const,
            alignItems: "flex-start" as const,
            gap: "$1",
          },
        }
      : {
          alignItems: "center" as const,
          gap: "$3",
          flexWrap: "wrap" as const,
        };

  const MetadataItem = ({ children }: { children: React.ReactNode }) => (
    <Text fontSize="$4">{children}</Text>
  );

  return (
    <XStack {...containerProps}>
      <MetadataItem>
        by{" "}
        <Text fontWeight="600">
          <Link
            to={`/pastes/${handle}`}
            style={{ color: "white", textDecoration: "underline" }}
          >
            @{handle}
          </Link>
        </Text>
      </MetadataItem>

      <Separator />

      <MetadataItem>
        <Text paddingHorizontal="$2" paddingVertical="$1" borderRadius="$3">
          {paste.language || "text"}
        </Text>
      </MetadataItem>

      <Separator />

      <MetadataItem>
        Created: {new Date(paste.createdAt).toLocaleString()}
      </MetadataItem>

      {paste.updatedAt && paste.updatedAt !== paste.createdAt && (
        <>
          <Separator />
          <MetadataItem>
            Updated: {new Date(paste.updatedAt).toLocaleString()}
          </MetadataItem>
        </>
      )}
    </XStack>
  );
}
