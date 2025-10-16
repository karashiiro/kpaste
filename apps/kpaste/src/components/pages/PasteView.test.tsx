/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { PasteView } from "./PasteView";
import type { PasteLoaderData } from "../../loaders/pasteLoader";

const config = createTamagui(defaultConfig);

// Mock useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

// Mock all the hooks
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../hooks/usePasteForm", () => ({
  usePasteForm: vi.fn(),
}));

vi.mock("../../hooks/useUpdatePaste", () => ({
  useUpdatePaste: vi.fn(),
}));

vi.mock("../../hooks/useDeletePaste", () => ({
  useDeletePaste: vi.fn(),
}));

// Mock the EditModal component
vi.mock("../paste/EditModal", () => ({
  EditModal: vi.fn(
    ({ isOpen, onClose, editForm, loading, onFormChange, onSubmit }) =>
      isOpen ? (
        <div data-testid="edit-modal">
          <button data-testid="close-modal" onClick={onClose}>
            Close
          </button>
          <input
            data-testid="edit-title"
            value={editForm?.title || ""}
            onChange={(e) =>
              onFormChange({ ...editForm, title: e.target.value })
            }
          />
          <textarea
            data-testid="edit-content"
            value={editForm?.content || ""}
            onChange={(e) =>
              onFormChange({ ...editForm, content: e.target.value })
            }
          />
          <button
            data-testid="submit-edit"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      ) : null,
  ),
}));

// Mock PasteMetadata component
vi.mock("../paste/PasteMetadata", () => ({
  PasteMetadata: vi.fn(({ paste, handle, responsive, variant }) => (
    <div data-testid="paste-metadata">
      <span data-testid="metadata-language">{paste.language}</span>
      <span data-testid="metadata-handle">{handle}</span>
      <span data-testid="metadata-created">{paste.createdAt}</span>
      {paste.updatedAt && (
        <span data-testid="metadata-updated">{paste.updatedAt}</span>
      )}
      <span data-testid="metadata-responsive">
        {responsive ? "true" : "false"}
      </span>
      <span data-testid="metadata-variant">{variant}</span>
    </div>
  )),
}));

// Mock safeHighlight utility
vi.mock("../../utils/prismUtils", () => ({
  safeHighlight: vi.fn(
    (content, language) =>
      `<span class="highlighted-${language}">${content}</span>`,
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

describe("PasteView", () => {
  const mockUpdatePaste = vi.fn();
  const mockDeletePaste = vi.fn();
  const mockSetEditForm = vi.fn();
  const mockCancelEdit = vi.fn();

  const mockPasteData: PasteLoaderData = {
    uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/3k2l4j5h6g7f",
    cid: "bafybeih2s4j2j2q2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j",
    rkey: "3k2l4j5h6g7f",
    pdsUrl: "https://bsky.social",
    handle: "testuser.bsky.social",
    content: "console.log('Hello, World!');",
    value: {
      $type: "moe.karashiiro.kpaste.paste",
      title: "Test Paste",
      language: "javascript",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T12:45:00Z",
      content: {
        $type: "blob",
        ref: {
          $link: "bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354",
        },
        mimeType: "text/plain",
        size: 1024,
      },
    },
  };

  const mockSession = {
    handle: "testuser.bsky.social",
    did: "did:plc:test123",
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock useLoaderData
    const routerModule = await import("react-router");
    vi.mocked(routerModule.useLoaderData).mockReturnValue(mockPasteData);

    // Mock useAuth - default to not authenticated
    const useAuthModule = await import("../../hooks/useAuth");
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      session: null,
    } as any);

    // Mock useUpdatePaste
    const useUpdatePasteModule = await import("../../hooks/useUpdatePaste");
    vi.mocked(useUpdatePasteModule.useUpdatePaste).mockReturnValue({
      updatePaste: mockUpdatePaste,
      loading: false,
      error: null,
    });

    // Mock useDeletePaste
    const useDeletePasteModule = await import("../../hooks/useDeletePaste");
    vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
      deletePaste: mockDeletePaste,
      loading: false,
      error: null,
    });

    // Mock usePasteForm
    const usePasteFormModule = await import("../../hooks/usePasteForm");
    vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
      editForm: null,
      setEditForm: mockSetEditForm,
      cancelEdit: mockCancelEdit,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render paste title and content", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Paste")).toBeInTheDocument();
      expect(screen.getByTestId("paste-metadata")).toBeInTheDocument();

      // Check that syntax highlighting is applied
      const preElement = document.querySelector("pre");
      expect(preElement).toHaveTextContent("console.log('Hello, World!');");
    });

    it("should render untitled paste when no title provided", async () => {
      const pasteWithoutTitle = {
        ...mockPasteData,
        value: { ...mockPasteData.value, title: "" },
      };

      const routerModule = await import("react-router");
      vi.mocked(routerModule.useLoaderData).mockReturnValue(pasteWithoutTitle);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Untitled Paste")).toBeInTheDocument();
    });

    it("should pass correct props to PasteMetadata", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByTestId("metadata-language")).toHaveTextContent(
        "javascript",
      );
      expect(screen.getByTestId("metadata-handle")).toHaveTextContent(
        "testuser.bsky.social",
      );
      expect(screen.getByTestId("metadata-responsive")).toHaveTextContent(
        "true",
      );
      expect(screen.getByTestId("metadata-variant")).toHaveTextContent(
        "inline",
      );
    });

    it("should apply syntax highlighting with correct language", async () => {
      const { safeHighlight } = await import("../../utils/prismUtils");

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(
        "console.log('Hello, World!');",
        "javascript",
      );
    });
  });

  describe("ownership and permissions", () => {
    it("should not show edit/delete buttons for non-owners", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("should show edit/delete buttons for paste owner", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should handle case where session handle doesn't match paste handle", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: { ...mockSession, handle: "different.bsky.social" },
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("should handle undefined session gracefully", async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: undefined,
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  describe("edit functionality", () => {
    beforeEach(async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);
    });

    it("should open edit form when edit button is clicked", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText("Edit"));

      expect(mockSetEditForm).toHaveBeenCalledWith({
        uri: mockPasteData.uri,
        originalRecord: mockPasteData.value,
        title: "Test Paste",
        content: "console.log('Hello, World!');",
        language: "javascript",
      });
    });

    it("should handle paste with no title when starting edit", async () => {
      const pasteWithoutTitle = {
        ...mockPasteData,
        value: { ...mockPasteData.value, title: "" },
      };

      const routerModule = await import("react-router");
      vi.mocked(routerModule.useLoaderData).mockReturnValue(pasteWithoutTitle);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText("Edit"));

      expect(mockSetEditForm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "",
        }),
      );
    });

    it("should show edit modal when editForm is set", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm: {
          uri: mockPasteData.uri,
          originalRecord: mockPasteData.value,
          title: "Test Paste",
          content: "console.log('Hello, World!');",
          language: "javascript",
        },
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
    });

    it("should not show edit modal when editForm is null", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
    });

    it("should submit edit when update button is clicked", async () => {
      const editForm = {
        uri: mockPasteData.uri,
        originalRecord: mockPasteData.value,
        title: "Updated Title",
        content: "console.log('Updated!');",
        language: "typescript",
      };

      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm,
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId("submit-edit"));

      expect(mockUpdatePaste).toHaveBeenCalledWith(editForm);
    });
  });

  describe("delete functionality", () => {
    beforeEach(async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);
    });

    it("should call delete when delete button is clicked", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText("Delete"));

      expect(mockDeletePaste).toHaveBeenCalledWith(mockPasteData.uri);
    });

    it("should show loading state on delete button when deleting", async () => {
      const useDeletePasteModule = await import("../../hooks/useDeletePaste");
      vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
        deletePaste: mockDeletePaste,
        loading: true,
        error: null,
      });

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Deleting...")).toBeInTheDocument();
    });

    it("should disable delete button when loading", async () => {
      const useDeletePasteModule = await import("../../hooks/useDeletePaste");
      vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
        deletePaste: mockDeletePaste,
        loading: true,
        error: null,
      });

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      // Find the actual button element by its role
      const deleteButton = screen.getByRole("button", { name: /deleting/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("loading states", () => {
    beforeEach(async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);
    });

    it("should pass loading state to edit modal", async () => {
      const useUpdatePasteModule = await import("../../hooks/useUpdatePaste");
      vi.mocked(useUpdatePasteModule.useUpdatePaste).mockReturnValue({
        updatePaste: mockUpdatePaste,
        loading: true,
        error: null,
      });

      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm: {
          uri: mockPasteData.uri,
          originalRecord: mockPasteData.value,
          title: "Test Paste",
          content: "console.log('Hello, World!');",
          language: "javascript",
        },
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
      } as any);

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Updating...")).toBeInTheDocument();
      expect(screen.getByTestId("submit-edit")).toBeDisabled();
    });
  });

  describe("edge cases", () => {
    it("should handle paste with no language", async () => {
      const pasteWithoutLanguage = {
        ...mockPasteData,
        value: { ...mockPasteData.value, language: "" },
      };

      const routerModule = await import("react-router");
      vi.mocked(routerModule.useLoaderData).mockReturnValue(
        pasteWithoutLanguage,
      );

      const { safeHighlight } = await import("../../utils/prismUtils");

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(
        "console.log('Hello, World!');",
        "text",
      );
    });

    it("should handle paste with undefined language", async () => {
      const pasteWithUndefinedLanguage = {
        ...mockPasteData,
        value: { ...mockPasteData.value, language: undefined },
      };

      const routerModule = await import("react-router");
      vi.mocked(routerModule.useLoaderData).mockReturnValue(
        pasteWithUndefinedLanguage,
      );

      const { safeHighlight } = await import("../../utils/prismUtils");

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(safeHighlight).toHaveBeenCalledWith(
        "console.log('Hello, World!');",
        "text",
      );
    });

    it("should handle empty content gracefully", async () => {
      const pasteWithEmptyContent = {
        ...mockPasteData,
        content: "",
      };

      const routerModule = await import("react-router");
      vi.mocked(routerModule.useLoaderData).mockReturnValue(
        pasteWithEmptyContent,
      );

      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      // Should not crash and should render metadata
      expect(screen.getByTestId("paste-metadata")).toBeInTheDocument();
    });

    it("should handle session changes reactively", async () => {
      const useAuthModule = await import("../../hooks/useAuth");

      // Initially not owner
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: { ...mockSession, handle: "different.bsky.social" },
      } as any);

      const { rerender } = render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();

      // Change to owner
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);

      rerender(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  describe("responsive design", () => {
    beforeEach(async () => {
      const useAuthModule = await import("../../hooks/useAuth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        session: mockSession,
      } as any);
    });

    it("should render edit/delete buttons in responsive layout", () => {
      render(
        <TestWrapper>
          <PasteView />
        </TestWrapper>,
      );

      // Check that buttons are rendered (specific responsive behavior tested via CSS)
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });
});
