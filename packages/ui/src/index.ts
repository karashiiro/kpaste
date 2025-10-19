// Re-export all UI components
export * from "./components/ui/index";
export * from "./components/auth/index";
export * from "./components/layout/index";

// Re-export utilities
export { safeHighlight } from "./utils/prismUtils";

// Re-export constants
export {
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_IDS,
  type LanguageConfig,
  type SupportedLanguageId,
} from "./constants/languages";
