import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { TamaguiProvider } from "@tamagui/core";
import { PasteForm } from "./PasteForm";
import type { CreatePasteForm, EditPasteForm } from "../../hooks/usePasteForm";
import type { Main as PasteRecord } from "@kpaste/lexicon/types";

// Mock window.matchMedia for Tamagui Select
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock CodeEditor component since it has complex dependencies
vi.mock("../ui/CodeEditor", () => ({
  CodeEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock LanguageSelect component to avoid Tamagui Select issues
vi.mock("../ui/LanguageSelect", () => ({
  LanguageSelect: ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <select
      data-testid="language-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="text">Plain Text</option>
      <option value="javascript">JavaScript</option>
      <option value="typescript">TypeScript</option>
      <option value="python">Python</option>
    </select>
  ),
}));

// Create Tamagui config for testing
const config = createTamagui(defaultConfig);

function renderWithProvider(component: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  flushSync(() => {
    root.render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
  });

  return { container, root };
}

describe("PasteForm", () => {
  const mockOnFormChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockOriginalRecord: PasteRecord = {
    $type: "moe.karashiiro.kpaste.paste",
    content: {
      $type: "blob",
      mimeType: "text/plain",
      size: 100,
      ref: { $link: "bafkreioriginal" },
    },
    title: "Original Title",
    language: "javascript",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    const createForm: CreatePasteForm = {
      title: "",
      content: "",
      language: "text",
    };

    it("should render create form with correct title and button", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={createForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const titleElement = container.querySelector("*");
      expect(titleElement?.textContent).toContain("Create New Paste");

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Create Paste"));
      expect(submitButton).toBeTruthy();

      const cancelButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Cancel"));
      expect(cancelButton).toBeFalsy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should render title input with correct placeholder", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={createForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const titleInput = container.querySelector(
        "input[placeholder*='title']",
      ) as HTMLInputElement;
      expect(titleInput).toBeTruthy();
      expect(titleInput.placeholder).toContain("title");
      expect(titleInput.value).toBe("");

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should render code editor with correct initial value", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={createForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const codeEditor = container.querySelector(
        '[data-testid="code-editor"]',
      ) as HTMLTextAreaElement;
      expect(codeEditor).toBeTruthy();
      expect(codeEditor.value).toBe("");

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should render language select with correct initial value", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={createForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const languageSelect = container.querySelector(
        '[data-testid="language-select"]',
      ) as HTMLSelectElement;
      expect(languageSelect).toBeTruthy();
      expect(languageSelect.value).toBe("text");

      // Verify options are present
      const options = languageSelect.querySelectorAll("option");
      expect(options.length).toBeGreaterThan(0);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should disable submit button when content is empty", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={createForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      expect(submitButton.disabled).toBe(true);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should enable submit button when content is provided", () => {
      const formWithContent = {
        ...createForm,
        content: "console.log('test');",
      };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithContent}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      expect(submitButton.disabled).toBe(false);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should show loading state", () => {
      const formWithContent = { ...createForm, content: "test content" };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithContent}
          loading={true}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const loadingButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Creating..."));
      expect(loadingButton).toBeTruthy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should call onSubmit when form is submitted", () => {
      const formWithContent = { ...createForm, content: "test content" };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithContent}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      submitButton.click();

      expect(mockOnSubmit).toHaveBeenCalled();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });
  });

  describe("Edit Mode", () => {
    const editForm: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      title: "Edit Test",
      content: "console.log('edit test');",
      language: "javascript",
      originalRecord: mockOriginalRecord,
    };

    it("should render edit form with correct title and buttons", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={editForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      );

      expect(container.textContent).toContain("Edit Paste");

      const updateButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Update Paste"));
      expect(updateButton).toBeTruthy();

      const cancelButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Cancel"));
      expect(cancelButton).toBeTruthy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should show loading state in edit mode", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={editForm}
          loading={true}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      );

      const loadingButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Updating..."));
      expect(loadingButton).toBeTruthy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should call onCancel when cancel button is pressed", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={editForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      );

      const cancelButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Cancel")) as HTMLButtonElement;

      expect(cancelButton).toBeTruthy();
      cancelButton.click();

      expect(mockOnCancel).toHaveBeenCalled();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should disable buttons when loading", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={editForm}
          loading={true}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      );

      const updateButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Updating..."),
      ) as HTMLButtonElement;

      const cancelButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Cancel")) as HTMLButtonElement;

      expect(updateButton?.disabled).toBe(true);
      expect(cancelButton?.disabled).toBe(true);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should call onSubmit when update button is pressed", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={editForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      );

      const updateButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Update Paste"),
      ) as HTMLButtonElement;

      expect(updateButton).toBeTruthy();
      updateButton.click();

      expect(mockOnSubmit).toHaveBeenCalled();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });
  });

  describe("Common Features", () => {
    const baseForm: CreatePasteForm = {
      title: "Test Title",
      content: "console.log('test');",
      language: "javascript",
    };

    it("should display form fields correctly", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={baseForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      expect(container.textContent).toContain("Title (optional):");
      expect(container.textContent).toContain("Content:");
      expect(container.textContent).toContain("Language:");
      expect(container.textContent).toContain(
        "Note: All pastes are publicly accessible",
      );

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should render LanguageSelect component", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={baseForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const languageSelect = container.querySelector(
        '[data-testid="language-select"]',
      );
      expect(languageSelect).toBeTruthy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should use custom submit button text when provided", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={baseForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
          submitButtonText="Custom Submit"
        />,
      );

      const customButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) => btn.textContent?.includes("Custom Submit"));
      expect(customButton).toBeTruthy();

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should disable submit when content is only whitespace", () => {
      const formWithWhitespace = { ...baseForm, content: "   \n  \t  " };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithWhitespace}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton?.disabled).toBe(true);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should show public accessibility notice", () => {
      const { container, root } = renderWithProvider(
        <PasteForm
          form={baseForm}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      expect(container.textContent).toContain(
        "Note: All pastes are publicly accessible",
      );

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });
  });

  describe("Form Validation", () => {
    it("should trim content for validation", () => {
      const formWithTrimmedContent = {
        title: "Test",
        content: " console.log('test'); ",
        language: "javascript",
      };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithTrimmedContent}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton?.disabled).toBe(false);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });

    it("should handle empty title gracefully", () => {
      const formWithEmptyTitle = {
        title: "",
        content: "test content",
        language: "text",
      };

      const { container, root } = renderWithProvider(
        <PasteForm
          form={formWithEmptyTitle}
          loading={false}
          onFormChange={mockOnFormChange}
          onSubmit={mockOnSubmit}
          mode="create"
        />,
      );

      // Should not crash and submit button should be enabled
      const submitButton = Array.from(
        container.querySelectorAll("button"),
      ).find((btn) =>
        btn.textContent?.includes("Create Paste"),
      ) as HTMLButtonElement;

      expect(submitButton?.disabled).toBe(false);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    });
  });
});
