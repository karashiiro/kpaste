import { useState } from "react";
import { Outlet } from "react-router";
import { OAuthModal } from "./components/OAuthModal";
import { RootLayout } from "./components/RootLayout";

export function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <RootLayout onLoginClick={() => setShowAuthModal(true)}>
        <Outlet />
      </RootLayout>
      <OAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
