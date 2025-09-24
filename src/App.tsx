import { useState } from "react";
import { Outlet } from "react-router";
import { AuthModal } from "./components/AuthModal";
import { RootLayout } from "./components/RootLayout";

export function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <RootLayout onLoginClick={() => setShowAuthModal(true)}>
        <Outlet />
      </RootLayout>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
