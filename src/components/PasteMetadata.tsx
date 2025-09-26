import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
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
      <Paragraph fontSize="$4" display="none" $sm={{ display: "flex" }}>
        •
      </Paragraph>
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

  return (
    <XStack {...containerProps}>
      <Paragraph fontSize="$4">by </Paragraph>
      <Paragraph fontWeight="600">
        <Link
          to={`/pastes/${handle}`}
          style={{ color: "white", textDecoration: "underline" }}
        >
          @{handle}
        </Link>
      </Paragraph>

      <Separator />

      <Paragraph
        fontSize="$4"
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$3"
      >
        {paste.language || "text"}
      </Paragraph>

      <Separator />

      <Paragraph fontSize="$4">
        Created: {new Date(paste.createdAt).toLocaleString()}
      </Paragraph>

      {paste.updatedAt && paste.updatedAt !== paste.createdAt && (
        <>
          <Separator />
          <Paragraph fontSize="$4">
            Updated: {new Date(paste.updatedAt).toLocaleString()}
          </Paragraph>
        </>
      )}
    </XStack>
  );
}
