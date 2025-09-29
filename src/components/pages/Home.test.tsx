/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { Home } from "./Home";

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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock all the hooks
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../hooks/useCreatePaste", () => ({
  useCreatePaste: vi.fn(),
}));

vi.mock("../../hooks/usePasteForm", () => ({
  usePasteForm: vi.fn(),
}));

vi.mock("../../hooks/useAuthContext", () => ({
  useAuthModal: vi.fn(),
}));

// Mock the PasteForm component
vi.mock("../paste/PasteForm", () => ({
  PasteForm: vi.fn(
    ({ onSubmit, submitButtonText, loading, form, onFormChange }) => (
      <div data-testid="paste-form">
        <input
          data-testid="title-input"
          value={form?.title || ""}
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
        />
        <textarea
          data-testid="content-input"
          value={form?.content || ""}
          onChange={(e) => onFormChange({ ...form, content: e.target.value })}
        />
        <button
          data-testid="submit-button"
          onClick={onSubmit}
          disabled={loading}
        >
          {submitButtonText}
        </button>
      </div>
    ),
  ),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("Home", () => {
  const mockCreatePaste = vi.fn();
  const mockOpenAuthModal = vi.fn();
  const mockSetCreateForm = vi.fn();

  const defaultCreateForm = {
    title: "",
    content: "",
    language: "javascript",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock useAuth
    const useAuthModule = await import("../../hooks/useAuth");
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: false,
    } as any);

    // Mock useCreatePaste
    const useCreatePasteModule = await import("../../hooks/useCreatePaste");
    vi.mocked(useCreatePasteModule.useCreatePaste).mockReturnValue({
      createPaste: mockCreatePaste,
      loading: false,
      error: null,
    });

    // Mock usePasteForm
    const usePasteFormModule = await import("../../hooks/usePasteForm");
    vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
      createForm: defaultCreateForm,
      setCreateForm: mockSetCreateForm,
    } as any);

    // Mock useAuthModal
    const useAuthContextModule = await import("../../hooks/useAuthContext");
    vi.mocked(useAuthContextModule.useAuthModal).mockReturnValue({
      openAuthModal: mockOpenAuthModal,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render page title and description", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.getByText("Create New Paste")).toBeInTheDocument();
      expect(
        screen.getByText("Share your code or text with the world"),
      ).toBeInTheDocument();
    });

    it("should render PasteForm component", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.getByTestId("paste-form")).toBeInTheDocument();
    });

    it("should show correct submit button text when not authenticated", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.getByText("Log in to create paste")).toBeInTheDocument();
    });

    it("should show correct submit button text when authenticated", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.getByText("Create Paste")).toBeInTheDocument();
    });
  });

  describe("authentication flow", () => {
    it("should save form to localStorage and open auth modal when not authenticated", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      // Submit form
      fireEvent.click(screen.getByTestId("submit-button"));

      // Should save the current form state (which is the default form)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "kpaste-draft",
        JSON.stringify(defaultCreateForm),
      );
      expect(mockOpenAuthModal).toHaveBeenCalled();
      expect(mockCreatePaste).not.toHaveBeenCalled();
    });

    it("should create paste directly when authenticated", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(mockCreatePaste).toHaveBeenCalledWith(defaultCreateForm);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockOpenAuthModal).not.toHaveBeenCalled();
    });
  });

  describe("draft restoration", () => {
    it("should restore draft from localStorage when user logs in", async () => {
      const savedDraft = {
        title: "Saved Title",
        content: "console.log('saved');",
        language: "typescript",
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedDraft));

      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("kpaste-draft");
      expect(mockSetCreateForm).toHaveBeenCalledWith(savedDraft);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("kpaste-draft");
    });

    it("should not restore empty content drafts", async () => {
      const emptyDraft = {
        title: "Title",
        content: "   ", // Only whitespace
        language: "javascript",
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(emptyDraft));

      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(mockSetCreateForm).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("kpaste-draft");
    });

    it("should handle invalid JSON in localStorage gracefully", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to parse saved draft:",
        expect.any(Error),
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("kpaste-draft");
      expect(mockSetCreateForm).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should not restore draft when user is not authenticated", () => {
      const savedDraft = {
        title: "Saved Title",
        content: "console.log('saved');",
        language: "typescript",
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedDraft));

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
      expect(mockSetCreateForm).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should display create paste errors", async () => {
      const useCreatePasteModule = await import("../../hooks/useCreatePaste");
      vi.mocked(useCreatePasteModule.useCreatePaste).mockReturnValue({
        createPaste: mockCreatePaste,
        loading: false,
        error: "Failed to create paste",
      });

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(
        screen.getByText("Error: Failed to create paste"),
      ).toBeInTheDocument();
    });

    it("should not display error when there is no error", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should pass loading state to PasteForm", async () => {
      const useCreatePasteModule = await import("../../hooks/useCreatePaste");
      vi.mocked(useCreatePasteModule.useCreatePaste).mockReturnValue({
        createPaste: mockCreatePaste,
        loading: true,
        error: null,
      });

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeDisabled();
    });

    it("should not disable submit button when not loading", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("form integration", () => {
    it("should pass form data correctly to PasteForm", async () => {
      const customForm = {
        title: "Custom Title",
        content: "Custom Content",
        language: "python",
      };

      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        createForm: customForm,
        setCreateForm: mockSetCreateForm,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(screen.getByDisplayValue("Custom Title")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Custom Content")).toBeInTheDocument();
    });

    it("should update form when onFormChange is called", () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      fireEvent.change(screen.getByTestId("title-input"), {
        target: { value: "New Title" },
      });

      expect(mockSetCreateForm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Title",
        }),
      );
    });
  });

  describe("component lifecycle", () => {
    it("should call useEffect to restore draft only once on mount", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      const { rerender } = render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);

      // Rerender should not call localStorage again
      rerender(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle undefined form gracefully", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        createForm: undefined,
        setCreateForm: mockSetCreateForm,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      // Should not crash and should render the form
      expect(screen.getByTestId("paste-form")).toBeInTheDocument();
    });

    it("should handle form submission with undefined form", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        createForm: undefined,
        setCreateForm: mockSetCreateForm,
      } as any);

      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(mockCreatePaste).toHaveBeenCalledWith(undefined);
    });

    it("should handle localStorage being unavailable", async () => {
      const originalLocalStorage = global.localStorage;
      delete (global as any).localStorage;

      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: false, // Set to false to avoid localStorage access
      } as any);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>,
      );

      // Should not crash
      expect(screen.getByTestId("paste-form")).toBeInTheDocument();

      global.localStorage = originalLocalStorage;
      consoleSpy.mockRestore();
    });
  });
});
