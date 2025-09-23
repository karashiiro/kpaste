import { describe, it, expect, vi } from "vitest";
import { getPrismLanguage, safeHighlight } from "./prismUtils";
import { languages, highlight } from "prismjs";

// Mock prismjs to avoid actual highlighting in tests
vi.mock("prismjs", () => ({
  languages: {
    javascript: { name: "javascript" },
    typescript: { name: "typescript" },
    python: { name: "python" },
    java: { name: "java" },
    cpp: { name: "cpp" },
    c: { name: "c" },
    clike: { name: "clike" },
    rust: { name: "rust" },
    go: { name: "go" },
    html: { name: "html" },
    markup: { name: "markup" },
    css: { name: "css" },
    json: { name: "json" },
    markdown: { name: "markdown" },
    text: { name: "text" },
    plain: { name: "plain" },
  },
  highlight: vi.fn((code: string) => `<highlighted>${code}</highlighted>`),
}));

describe("prismUtils", () => {
  describe("getPrismLanguage", () => {
    it("should return correct language for supported languages", () => {
      expect(getPrismLanguage("javascript")).toEqual({ name: "javascript" });
      expect(getPrismLanguage("typescript")).toEqual({ name: "typescript" });
      expect(getPrismLanguage("python")).toEqual({ name: "python" });
      expect(getPrismLanguage("java")).toEqual({ name: "java" });
      expect(getPrismLanguage("rust")).toEqual({ name: "rust" });
      expect(getPrismLanguage("go")).toEqual({ name: "go" });
      expect(getPrismLanguage("html")).toEqual({ name: "html" });
      expect(getPrismLanguage("css")).toEqual({ name: "css" });
      expect(getPrismLanguage("json")).toEqual({ name: "json" });
      expect(getPrismLanguage("markdown")).toEqual({ name: "markdown" });
    });

    it("should handle cpp with fallbacks", () => {
      // cpp should try cpp -> c -> clike -> text
      expect(getPrismLanguage("cpp")).toEqual({ name: "cpp" });
    });

    it("should fallback to text for unsupported languages", () => {
      expect(getPrismLanguage("unsupported-lang")).toEqual({ name: "text" });
      expect(getPrismLanguage("random")).toEqual({ name: "text" });
      expect(getPrismLanguage("")).toEqual({ name: "text" });
    });

    it("should handle typescript fallback to javascript", () => {
      // Mock scenario where typescript is not available
      const originalTypescript = languages.typescript;
      // @ts-expect-error - intentionally testing undefined fallback
      languages.typescript = undefined;
      expect(getPrismLanguage("typescript")).toEqual({ name: "javascript" });
      languages.typescript = originalTypescript;
    });
  });

  describe("safeHighlight", () => {
    it("should highlight code successfully", () => {
      const code = 'console.log("hello")';
      const result = safeHighlight(code, "javascript");
      expect(result).toBe('<highlighted>console.log("hello")</highlighted>');
      expect(highlight).toHaveBeenCalledWith(
        code,
        { name: "javascript" },
        "javascript",
      );
    });

    it("should return original code when language is not found", () => {
      // Mock scenario where getPrismLanguage returns null
      const originalLanguages = { ...languages };
      Object.keys(languages).forEach((key) => delete languages[key]);

      const code = "some code";
      const result = safeHighlight(code, "nonexistent");
      expect(result).toBe("some code");

      // Restore languages
      Object.assign(languages, originalLanguages);
    });

    it("should handle highlighting errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockHighlight = vi.mocked(highlight);
      mockHighlight.mockImplementationOnce(() => {
        throw new Error("Highlighting failed");
      });

      const code = "problematic code";
      const result = safeHighlight(code, "javascript");

      expect(result).toBe("problematic code");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Syntax highlighting failed:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
      mockHighlight.mockRestore();
    });

    it("should handle empty code", () => {
      const result = safeHighlight("", "javascript");
      expect(result).toBe("<highlighted></highlighted>");
    });

    it("should handle multiline code", () => {
      const code = 'function test() {\n  return "hello";\n}';
      const result = safeHighlight(code, "javascript");
      expect(result).toBe(
        '<highlighted>function test() {\n  return "hello";\n}</highlighted>',
      );
    });
  });
});
