import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Link } from "react-router";
import type { PasteRecord } from "../../types";

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
      <Paragraph
        fontSize="$4"
        display="none"
        paddingRight="$2"
        $sm={{ display: "flex" }}
      >
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
      <XStack>
        <Paragraph fontSize="$4">by&nbsp;</Paragraph>
        <Paragraph fontWeight="600" paddingRight="$2">
          <Link
            to={`/pastes/${handle}`}
            style={{ color: "white", textDecoration: "underline" }}
          >
            @{handle}
          </Link>
        </Paragraph>
      </XStack>

      <Separator />

      <Paragraph fontSize="$4" paddingRight="$2">
        {paste.language || "text"}
      </Paragraph>

      <Separator />

      <Paragraph fontSize="$4" paddingRight="$2">
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
