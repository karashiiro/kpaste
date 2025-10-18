import { highlight, languages } from "prismjs";

export const SUPPORTED_LANGUAGES = [
  "text",
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "rust",
  "go",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
];

export function getPrismLanguage(language: string) {
  switch (language) {
    case "javascript":
      return languages.javascript;
    case "typescript":
      return languages.typescript || languages.javascript;
    case "python":
      return languages.python;
    case "java":
      return languages.java;
    case "cpp":
      return languages.cpp || languages.c || languages.clike;
    case "csharp":
      return languages.csharp;
    case "rust":
      return languages.rust;
    case "go":
      return languages.go;
    case "html":
      return languages.html || languages.markup;
    case "css":
      return languages.css;
    case "json":
      return languages.json;
    case "markdown":
      return languages.markdown;
    case "bash":
      return languages.bash;
    default:
      // Not a real language, prismjs will just return the code as-is
      return languages.plain;
  }
}

export function safeHighlight(code: string, language: string): string {
  try {
    const prismLang = getPrismLanguage(language);
    if (prismLang) {
      return highlight(code, prismLang, language);
    }
    return code;
  } catch (error) {
    console.warn("Syntax highlighting failed:", error);
    return code;
  }
}
