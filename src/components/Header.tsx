import { useAuth } from "../auth/useAuth";
import { XStack, YStack, Text, Button, View } from "tamagui";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { isAuthenticated, session, logout, isLoading } = useAuth();

  return (
    <View
      background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      paddingVertical="$5"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={10}
      zIndex={100}
    >
      <XStack
        maxWidth={1200}
        marginHorizontal="auto"
        paddingHorizontal="$6"
        justifyContent="space-between"
        alignItems="center"
        minHeight="$6"
        width="100%"
      >
        <YStack space="$2" flex={1}>
          <Text fontSize="$9" fontWeight="700" color="white">
            📝 KPaste
          </Text>
          <Text fontSize="$4" color="white" opacity={0.9} fontWeight="400">
            AT Protocol Pastebin
          </Text>
        </YStack>

        <XStack alignItems="center" justifyContent="flex-end">
          {isAuthenticated && session ? (
            <XStack alignItems="center" space="$5">
              <YStack alignItems="flex-end" space="$1">
                <Text fontWeight="600" fontSize="$5" color="white">
                  @{session.handle}
                </Text>
                <Text fontSize="$3" color="white" opacity={0.8}>
                  {session.endpoint.url}
                </Text>
              </YStack>
              <Button
                onPress={logout}
                disabled={isLoading}
                backgroundColor="rgba(255, 255, 255, 0.1)"
                borderColor="rgba(255, 255, 255, 0.2)"
                borderWidth={1}
                color="white"
                fontSize="$4"
                paddingHorizontal="$4"
                paddingVertical="$3"
                borderRadius="$10"
                size="$4"
                hoverStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
                pressStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                {isLoading ? "🔄" : "👋"} Logout
              </Button>
            </XStack>
          ) : (
            <Button
              onPress={onLoginClick}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth={2}
              color="white"
              fontWeight="600"
              paddingHorizontal="$6"
              paddingVertical="$4"
              borderRadius="$12"
              fontSize="$5"
              size="$5"
              hoverStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderColor: "rgba(255, 255, 255, 0.5)",
                transform: [{ translateY: -2 }],
                shadowColor: "$shadowColor",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
              }}
              pressStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              }}
            >
              🚀 Login
            </Button>
          )}
        </XStack>
      </XStack>
    </View>
  );
}
