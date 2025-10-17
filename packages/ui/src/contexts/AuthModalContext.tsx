import { createContext, useContext } from "react";

interface AuthModalContextType {
  openAuthModal: () => void;
}

export const AuthModalContext = createContext<AuthModalContextType | null>(
  null,
);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
