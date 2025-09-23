import { useLoaderData, Link } from "react-router";
import { YStack, XStack, Text, Card, View } from "tamagui";
import { safeHighlight } from "../prismUtils";
import type { PasteLoaderData } from "../loaders/pasteLoader";

export function PasteView() {
  console.log("🔄 PasteView render");

  const paste = useLoaderData() as PasteLoaderData;

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <View
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        paddingVertical="$4"
        paddingHorizontal="$4"
      >
        <XStack
          alignItems="center"
          justifyContent="space-between"
          maxWidth={1200}
          marginHorizontal="auto"
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Back to KPaste
          </Link>
        </XStack>
      </View>

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
              by <Text fontWeight="600">@{paste.handle}</Text>
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
