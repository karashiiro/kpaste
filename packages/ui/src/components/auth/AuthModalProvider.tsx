import type { ReactNode } from "react";
import {
  AuthModalContext,
  useAuthModal,
} from "../../contexts/AuthModalContext";

// Re-export for convenience
export { useAuthModal };

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
