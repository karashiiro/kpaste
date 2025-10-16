import { createContext } from "react";

interface AuthModalContextType {
  openAuthModal: () => void;
}

export const AuthModalContext = createContext<AuthModalContextType | null>(
  null,
);
