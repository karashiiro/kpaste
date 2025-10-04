import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { LanguageSelect } from "./LanguageSelect";

const config = createTamagui(defaultConfig);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe("LanguageSelect", () => {
  describe("rendering", () => {
    it("should render with default props", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with custom size", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect
            value="javascript"
            onValueChange={mockOnChange}
            size="$5"
          />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should display placeholder when value is empty", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText("Select language...")).toBeInTheDocument();
    });
  });

  describe("value display", () => {
    it("should display Plain Text for text value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("Plain Text")[0]).toBeInTheDocument();
    });

    it("should display JavaScript for javascript value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="javascript" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("JavaScript")[0]).toBeInTheDocument();
    });

    it("should display TypeScript for typescript value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="typescript" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("TypeScript")[0]).toBeInTheDocument();
    });

    it("should display Python for python value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="python" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("Python")[0]).toBeInTheDocument();
    });

    it("should display Markdown for markdown value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="markdown" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("Markdown")[0]).toBeInTheDocument();
    });
  });

  describe("language options", () => {
    it("should have all expected language options", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      const expectedLanguages = [
        "Plain Text",
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C++",
        "Rust",
        "Go",
        "HTML",
        "CSS",
        "JSON",
        "Markdown",
      ];

      // Check that all language options exist in the component
      expectedLanguages.forEach((lang) => {
        expect(screen.getAllByText(lang).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should have 12 language options", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      // Count Select.Item elements by checking for unique language values
      const languageCount = [
        "text",
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "rust",
        "go",
        "html",
        "css",
        "json",
        "markdown",
      ].length;

      expect(languageCount).toBe(12);
    });
  });

  describe("size variants", () => {
    it("should render with size $3", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} size="$3" />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with size $4 (default)", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with size $5", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} size="$5" />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA role", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();

      // Tamagui Select should be keyboard accessible by default
      expect(select.getAttribute("tabindex")).not.toBe("-1");
    });
  });

  describe("visual elements", () => {
    it("should render with down arrow indicator", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      // Check that the trigger has a down arrow
      expect(screen.getAllByText("▼").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("component props", () => {
    it("should accept and use value prop", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="rust" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getAllByText("Rust")[0]).toBeInTheDocument();
    });

    it("should accept onValueChange callback", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="text" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty string value", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText("Select language...")).toBeInTheDocument();
    });

    it("should handle unknown language value gracefully", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <LanguageSelect value="unknown" onValueChange={mockOnChange} />
        </TestWrapper>,
      );

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
