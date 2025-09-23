import { useLoaderData, Link } from "react-router";
import { YStack, XStack, Text, Card } from "tamagui";
import { Header } from "./Header";
import { safeHighlight } from "../prismUtils";
import type { PasteLoaderData } from "../loaders/pasteLoader";

export function PasteView() {
  const paste = useLoaderData() as PasteLoaderData;

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <Header variant="simple" showCreateLink={true} />

      <YStack
        padding="$4"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        space="$4"
      >
        <YStack space="$2">
          <Text fontSize="$8" fontWeight="700">
            {paste.value.title || "📝 Untitled Paste"}
          </Text>
          <XStack alignItems="center" space="$2">
            <Text fontSize="$4">
              by{" "}
              <Text fontWeight="600">
                <Link
                  to={`/pastes/${paste.handle}`}
                  style={{ color: "white", textDecoration: "underline" }}
                >
                  @{paste.handle}
                </Link>
              </Text>
            </Text>
            <Text fontSize="$4">•</Text>
            <Text
              fontSize="$4"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
            >
              {paste.value.language || "text"}
            </Text>
            <Text fontSize="$4">•</Text>
            <Text fontSize="$4">
              {new Date(paste.value.createdAt).toLocaleString()}
            </Text>
          </XStack>
        </YStack>

        <Card padding="$0" bordered>
          <pre
            style={{
              fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
              fontSize: 14,
              lineHeight: 1.4,
              margin: 0,
              padding: 12,
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{
              __html: safeHighlight(
                paste.content,
                paste.value.language || "text",
              ),
            }}
          />
        </Card>

        <Card padding="$3">
          <Text fontSize="$3" fontFamily="$mono">
            <Text fontWeight="600">URI:</Text> {paste.uri}
          </Text>
        </Card>
      </YStack>
    </YStack>
  );
}
