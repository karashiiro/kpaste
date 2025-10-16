import type { ReactNode } from "react";
import { AuthModalContext } from "../../contexts/AuthModalContext";

interface AuthModalProviderProps {
  children: ReactNode;
  onOpenAuthModal: () => void;
}

export function AuthModalProvider({
  children,
  onOpenAuthModal,
}: AuthModalProviderProps) {
  return (
    <AuthModalContext.Provider value={{ openAuthModal: onOpenAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}
