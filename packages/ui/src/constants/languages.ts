export interface LanguageConfig {
  id: string;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { id: "text", label: "Plain Text" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "lua", label: "Lua" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "bash", label: "Bash" },
] as const;

// Helper to get just the language IDs
export const SUPPORTED_LANGUAGE_IDS = SUPPORTED_LANGUAGES.map(
  (lang) => lang.id,
);

// Type for language IDs
export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGES)[number]["id"];
