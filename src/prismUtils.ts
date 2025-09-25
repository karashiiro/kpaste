import { highlight, languages } from "prismjs";

// Cache for loaded languages to avoid re-importing
const loadedLanguages = new Set<string>();

// Dynamic language loader!! ✨
async function loadPrismLanguage(language: string): Promise<void> {
  if (loadedLanguages.has(language)) return;

  try {
    switch (language) {
      case "javascript":
        // @ts-expect-error - PrismJS components don't have proper TypeScript declarations
        await import("prismjs/components/prism-javascript");
        loadedLanguages.add("javascript");
        break;
      case "typescript":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-javascript");
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-typescript");
        loadedLanguages.add("javascript");
        loadedLanguages.add("typescript");
        break;
      case "python":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-python");
        loadedLanguages.add("python");
        break;
      case "java":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-clike");
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-java");
        loadedLanguages.add("clike");
        loadedLanguages.add("java");
        break;
      case "cpp":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-clike");
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-c");
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-cpp");
        loadedLanguages.add("clike");
        loadedLanguages.add("c");
        loadedLanguages.add("cpp");
        break;
      case "rust":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-rust");
        loadedLanguages.add("rust");
        break;
      case "go":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-go");
        loadedLanguages.add("go");
        break;
      case "css":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-css");
        loadedLanguages.add("css");
        break;
      case "json":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-json");
        loadedLanguages.add("json");
        break;
      case "markdown":
        // @ts-expect-error - No TypeScript declarations for PrismJS components
        await import("prismjs/components/prism-markdown");
        loadedLanguages.add("markdown");
        break;
    }
  } catch (error) {
    console.warn(`Failed to load PrismJS language: ${language}`, error);
  }
}

export function getPrismLanguage(language: string) {
  switch (language) {
    case "javascript":
      return languages.javascript || languages.text;
    case "typescript":
      return languages.typescript || languages.javascript || languages.text;
    case "python":
      return languages.python || languages.text;
    case "java":
      return languages.java || languages.text;
    case "cpp":
      return languages.cpp || languages.c || languages.clike || languages.text;
    case "rust":
      return languages.rust || languages.text;
    case "go":
      return languages.go || languages.text;
    case "html":
      return languages.html || languages.markup || languages.text;
    case "css":
      return languages.css || languages.text;
    case "json":
      return languages.json || languages.text;
    case "markdown":
      return languages.markdown || languages.text;
    default:
      return languages.text || languages.plain;
  }
}

// Async version of safeHighlight that loads languages on-demand!! 🚀
export async function safeHighlightAsync(
  code: string,
  language: string,
): Promise<string> {
  try {
    // Load the language dynamically if needed
    await loadPrismLanguage(language);

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

// Synchronous version for backward compatibility (will use loaded languages only)
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
