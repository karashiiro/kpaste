import { useContext } from "react";
import { AuthModalContext } from "../contexts/AuthModalContext";

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
