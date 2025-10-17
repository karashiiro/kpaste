import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OAuthModal, RootLayout, AuthModalProvider } from "@kpaste-app/ui";

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
