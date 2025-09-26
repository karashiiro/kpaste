import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OAuthModal } from "./components/OAuthModal";
import { RootLayout } from "./components/RootLayout";
import { AuthModalProvider } from "./contexts/AuthModalContext";

export function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const handleLoginClick = () => {
    // Save current URL for post-login redirect
    localStorage.setItem(
      "kpaste_return_url",
      location.pathname + location.search + location.hash,
    );
    setShowAuthModal(true);
  };

  return (
    <AuthModalProvider onOpenAuthModal={handleLoginClick}>
      <RootLayout onLoginClick={handleLoginClick}>
        <Outlet />
      </RootLayout>
      <OAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </AuthModalProvider>
  );
}
