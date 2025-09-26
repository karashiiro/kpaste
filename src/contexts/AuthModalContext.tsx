import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface AuthModalContextType {
  openAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

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

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
