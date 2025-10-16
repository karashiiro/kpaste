import { describe, it, expect } from "vitest";
import { safeHighlight } from "./prismUtils";
import { languages } from "prismjs";

describe("prismUtils", () => {
  describe("safeHighlight", () => {
    it("should highlight code successfully", () => {
      const code = 'console.log("hello")';
      const result = safeHighlight(code, "javascript");
      expect(result).toBe(
        'console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"hello"</span><span class="token punctuation">)</span>',
      );
    });

    it("should return original code when language is not found", () => {
      // Mock scenario where getPrismLanguage returns null
      const originalLanguages = { ...languages };
      try {
        Object.keys(languages).forEach((key) => delete languages[key]);

        const code = "some code";
        const result = safeHighlight(code, "nonexistent");
        expect(result).toBe("some code");
      } finally {
        // Restore languages
        Object.assign(languages, originalLanguages);
      }
    });

    it("should handle empty code", () => {
      const result = safeHighlight("", "javascript");
      expect(result).toBe("");
    });

    it("should handle multiline code", () => {
      const code = 'function test() {\n  return "hello";\n}';
      const result = safeHighlight(code, "javascript");
      expect(result).toBe(
        '<span class="token keyword">function</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token string">"hello"</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>',
      );
    });
  });
});
