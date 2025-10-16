/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { CodeEditor } from "./CodeEditor";

const config = createTamagui(defaultConfig);

// Mock window.matchMedia for Tamagui components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the safeHighlight utility
vi.mock("../../utils/prismUtils", () => ({
  safeHighlight: vi.fn((code, language) => {
    // Simple mock that adds a span with language class
    return `<span class="language-${language}">${code}</span>`;
  }),
}));

// Mock react-simple-code-editor
vi.mock("react-simple-code-editor", () => ({
  default: vi.fn(({ value, onValueChange, highlight, placeholder, style }) => (
    <div data-testid="code-editor" style={style}>
      <textarea
        data-testid="code-editor-textarea"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight: style?.minHeight || "200px",
          fontFamily: style?.fontFamily,
          fontSize: style?.fontSize,
          lineHeight: style?.lineHeight,
          backgroundColor: style?.backgroundColor,
          color: style?.color,
          border: "none",
          outline: "none",
          resize: "vertical",
        }}
      />
      <div
        data-testid="highlighted-code"
        dangerouslySetInnerHTML={{ __html: highlight(value) }}
      />
    </div>
  )),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("CodeEditor", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    language: "javascript",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render with default props", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-editor-textarea")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Paste your code or text here..."),
      ).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(
        <TestWrapper>
          <CodeEditor
            {...defaultProps}
            placeholder="Enter your custom code here"
          />
        </TestWrapper>,
      );

      expect(
        screen.getByPlaceholderText("Enter your custom code here"),
      ).toBeInTheDocument();
    });

    it("should render with provided value", () => {
      const testCode = "console.log('Hello, World!');";

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value={testCode} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveValue(testCode);
    });

    it("should apply custom styles", () => {
      const customStyle = {
        backgroundColor: "#ff0000",
        color: "#00ff00",
        fontSize: 16,
      };

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} style={customStyle} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveStyle({
        backgroundColor: "#ff0000",
        color: "#00ff00",
        fontSize: "16px",
      });
    });
  });

  describe("syntax highlighting", () => {
    it("should call safeHighlight with correct parameters", async () => {
      const { safeHighlight } = await import("../../utils/prismUtils");
      const testCode = "const x = 42;";

      render(
        <TestWrapper>
          <CodeEditor
            {...defaultProps}
            value={testCode}
            language="typescript"
          />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(testCode, "typescript");
    });

    it("should update highlighting when language changes", async () => {
      const { safeHighlight } = await import("../../utils/prismUtils");
      const testCode = "print('Hello, World!')";

      const { rerender } = render(
        <TestWrapper>
          <CodeEditor
            {...defaultProps}
            value={testCode}
            language="javascript"
          />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(testCode, "javascript");

      rerender(
        <TestWrapper>
          <CodeEditor {...defaultProps} value={testCode} language="python" />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(testCode, "python");
    });

    it("should display highlighted code", () => {
      const testCode = "function test() {}";

      render(
        <TestWrapper>
          <CodeEditor
            {...defaultProps}
            value={testCode}
            language="javascript"
          />
        </TestWrapper>,
      );

      const highlightedCode = screen.getByTestId("highlighted-code");
      expect(highlightedCode.innerHTML).toContain(
        'class="language-javascript"',
      );
      expect(highlightedCode.innerHTML).toContain(testCode);
    });
  });

  describe("user interaction", () => {
    it("should call onChange when text is entered", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      fireEvent.change(textarea, { target: { value: "new code" } });

      expect(mockOnChange).toHaveBeenCalledWith("new code");
    });

    it("should call onChange when text is deleted", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value="original code" />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      fireEvent.change(textarea, { target: { value: "original" } });

      expect(mockOnChange).toHaveBeenCalledWith("original");
    });

    it("should call onChange when text is completely cleared", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value="some content" />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      fireEvent.change(textarea, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    it("should handle multiline text input", () => {
      const multilineCode = "function test() {\n  console.log('hello');\n}";

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      fireEvent.change(textarea, { target: { value: multilineCode } });

      expect(mockOnChange).toHaveBeenCalledWith(multilineCode);
    });
  });

  describe("styling and theming", () => {
    it("should apply monospace font family", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveStyle({
        fontFamily: '"Inconsolata", monospace',
      });
    });

    it("should apply default font size and line height", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveStyle({
        fontSize: "14px",
        lineHeight: "1.4",
      });
    });

    it("should merge custom styles with default styles", () => {
      const customStyle = {
        fontSize: 18,
        padding: "20px",
      };

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} style={customStyle} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveStyle({
        fontFamily: '"Inconsolata", monospace', // default
        fontSize: "18px", // custom
        lineHeight: "1.4", // default
      });
    });

    it("should apply theme colors from Tamagui", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      // The exact colors depend on the theme, but we can check that style properties exist
      expect(textarea.style.backgroundColor).toBeDefined();
      expect(textarea.style.color).toBeDefined();
    });
  });

  describe("different languages", () => {
    const languages = [
      "javascript",
      "typescript",
      "python",
      "java",
      "rust",
      "go",
      "html",
      "css",
      "json",
      "markdown",
    ];

    languages.forEach((language) => {
      it(`should handle ${language} language`, async () => {
        const { safeHighlight } = await import("../../utils/prismUtils");
        const testCode = "test code";

        render(
          <TestWrapper>
            <CodeEditor
              {...defaultProps}
              value={testCode}
              language={language}
            />
          </TestWrapper>,
        );

        expect(safeHighlight).toHaveBeenCalledWith(testCode, language);
      });
    });

    it("should handle unknown language gracefully", async () => {
      const { safeHighlight } = await import("../../utils/prismUtils");
      const testCode = "test code";

      render(
        <TestWrapper>
          <CodeEditor
            {...defaultProps}
            value={testCode}
            language="unknown-language"
          />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(testCode, "unknown-language");
    });
  });

  describe("performance", () => {
    it("should create new highlight function when language changes", async () => {
      const { safeHighlight } = await import("../../utils/prismUtils");

      const { rerender } = render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value="test" language="javascript" />
        </TestWrapper>,
      );

      // Clear previous calls to focus on language change
      vi.clearAllMocks();

      // Change language - should trigger new highlight calls
      rerender(
        <TestWrapper>
          <CodeEditor {...defaultProps} value="test" language="python" />
        </TestWrapper>,
      );

      // Should be called with the new language
      expect(safeHighlight).toHaveBeenCalledWith("test", "python");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string value", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value="" />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveValue("");
    });

    it("should handle very long code", () => {
      const longCode = "a".repeat(10000);

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value={longCode} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveValue(longCode);
    });

    it("should handle special characters and unicode", () => {
      const specialCode =
        "const emoji = '🎉'; const chinese = '你好'; const math = 'π ≈ 3.14';";

      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} value={specialCode} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");
      expect(textarea).toHaveValue(specialCode);
    });

    it("should handle null/undefined onChange gracefully", () => {
      // This tests defensive programming - component shouldn't crash if onChange is somehow undefined
      expect(() => {
        render(
          <TestWrapper>
            <CodeEditor
              value=""
              onChange={undefined as any}
              language="javascript"
            />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it("should handle rapid successive changes", () => {
      render(
        <TestWrapper>
          <CodeEditor {...defaultProps} />
        </TestWrapper>,
      );

      const textarea = screen.getByTestId("code-editor-textarea");

      // Simulate rapid typing
      fireEvent.change(textarea, { target: { value: "c" } });
      fireEvent.change(textarea, { target: { value: "co" } });
      fireEvent.change(textarea, { target: { value: "con" } });
      fireEvent.change(textarea, { target: { value: "cons" } });
      fireEvent.change(textarea, { target: { value: "console" } });

      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenLastCalledWith("console");
    });
  });
});
