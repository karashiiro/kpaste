import { useState } from "react";
import { YStack, View } from "tamagui";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { PasteManager } from "./components/PasteManager";

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />
      <View
        padding="$6"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        flex={1}
      >
        <PasteManager />
      </View>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </YStack>
  );
}

export default App;
