import { highlight, languages } from "prismjs";

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
