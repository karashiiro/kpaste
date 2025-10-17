import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { PasteList } from "./PasteList";
import type { PasteListItem } from "../../types";

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

// Mock all the hooks
vi.mock("../../hooks/useDeletePaste", () => ({
  useDeletePaste: vi.fn(),
}));

vi.mock("../../hooks/useUpdatePaste", () => ({
  useUpdatePaste: vi.fn(),
}));

vi.mock("../../hooks/usePasteForm", () => ({
  usePasteForm: vi.fn(),
}));

// Mock the EditModal component
vi.mock("./EditModal", () => ({
  EditModal: vi.fn(({ isOpen, onClose, onSubmit }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSubmit}>Submit</button>
      </div>
    ) : null,
  ),
}));

// Mock utility functions
vi.mock("@kpaste/ui", async () => {
  const actual = await vi.importActual("@kpaste/ui");
  return {
    ...actual,
    safeHighlight: vi.fn(
      (content) => `<span class="highlight">${content}</span>`,
    ),
  };
});

vi.mock("../../utils/pdsUtils", () => ({
  parseAtUri: vi.fn((uri) => {
    if (uri.includes("at://")) {
      // Extract rkey from the actual URI instead of hardcoding test123
      const match = uri.match(/^at:\/\/([^/]+)\/[^/]+\/([^/]+)$/);
      if (match) {
        return {
          handle: match[1], // Use correct property name
          rkey: match[2], // Extract actual rkey from URI
        };
      }
    }
    return null;
  }),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("PasteList", () => {
  const mockDeletePaste = vi.fn();
  const mockUpdatePaste = vi.fn();
  const mockSetEditForm = vi.fn();
  const mockCancelEdit = vi.fn();

  const mockPastes: PasteListItem[] = [
    {
      uri: "at://did:plc:test/moe.karashiiro.kpaste.paste/test123",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test Paste 1",
        language: "javascript",
        createdAt: "2024-01-01T10:00:00Z",
        content: {
          $type: "blob",
          ref: { $link: "blob123" },
          mimeType: "text/plain",
          size: 100,
        },
      },
      content: "console.log('Hello World');",
    },
    {
      uri: "at://did:plc:test/moe.karashiiro.kpaste.paste/test456",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test Paste 2",
        language: "python",
        createdAt: "2024-01-02T10:00:00Z",
        updatedAt: "2024-01-03T10:00:00Z",
        content: {
          $type: "blob",
          ref: { $link: "blob456" },
          mimeType: "text/plain",
          size: 200,
        },
      },
      content: "print('Hello Python')",
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock useDeletePaste
    const useDeletePasteModule = await import("../../hooks/useDeletePaste");
    vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
      deletePaste: mockDeletePaste,
      loading: false,
      error: null,
    });

    // Mock useUpdatePaste
    const useUpdatePasteModule = await import("../../hooks/useUpdatePaste");
    vi.mocked(useUpdatePasteModule.useUpdatePaste).mockReturnValue({
      updatePaste: mockUpdatePaste,
      loading: false,
      error: null,
    });

    // Mock usePasteForm
    const usePasteFormModule = await import("../../hooks/usePasteForm");
    vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
      editForm: null,
      setEditForm: mockSetEditForm,
      cancelEdit: mockCancelEdit,
      showCreateForm: false,
      setShowCreateForm: vi.fn(),
      createForm: {
        title: "",
        content: "",
        language: "",
      },
      setCreateForm: vi.fn(),
      resetForm: vi.fn(),
    });
  });

  describe("empty state", () => {
    it("should render empty state when no pastes provided", () => {
      render(
        <TestWrapper>
          <PasteList
            pastes={[]}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(
        screen.getByText("No pastes found. Create your first paste!"),
      ).toBeInTheDocument();
      // Check for the document icon in the empty state
      const svgIcon = document.querySelector("svg");
      expect(svgIcon).toBeInTheDocument();
    });
  });

  describe("paste list rendering", () => {
    // TODO: Make not timezone dependent
    it.skip("should render list of pastes with correct information", () => {
      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      // Check paste titles
      expect(screen.getByText("Test Paste 1")).toBeInTheDocument();
      expect(screen.getByText("Test Paste 2")).toBeInTheDocument();

      // Check languages
      expect(screen.getByText("javascript")).toBeInTheDocument();
      expect(screen.getByText("python")).toBeInTheDocument();

      // Check creation dates
      expect(screen.getByText("1/1/2024, 2:00:00 AM")).toBeInTheDocument();
      expect(screen.getByText("1/2/2024, 2:00:00 AM")).toBeInTheDocument();

      // Check updated date (only for second paste)
      expect(screen.getByText("1/3/2024, 2:00:00 AM")).toBeInTheDocument();
    });

    it("should render paste content with syntax highlighting", async () => {
      const uiModule = await import("@kpaste/ui");

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(uiModule.safeHighlight).toHaveBeenCalledWith(
        "console.log('Hello World');",
        "javascript",
      );
      expect(uiModule.safeHighlight).toHaveBeenCalledWith(
        "print('Hello Python')",
        "python",
      );
    });

    it("should handle pastes without titles", () => {
      const pastesWithoutTitle = [
        {
          ...mockPastes[0],
          value: { ...mockPastes[0].value, title: undefined },
        },
      ];

      render(
        <TestWrapper>
          <PasteList
            pastes={pastesWithoutTitle}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Untitled Paste")).toBeInTheDocument();
    });

    it("should handle pastes without language", () => {
      const pastesWithoutLanguage = [
        {
          ...mockPastes[0],
          value: { ...mockPastes[0].value, language: undefined },
        },
      ];

      render(
        <TestWrapper>
          <PasteList
            pastes={pastesWithoutLanguage}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("text")).toBeInTheDocument();
    });

    it("should only show updated date when different from created date", () => {
      const pasteWithSameDate = [
        {
          ...mockPastes[0],
          value: {
            ...mockPastes[0].value,
            updatedAt: mockPastes[0].value.createdAt, // Same as created date
          },
        },
      ];

      render(
        <TestWrapper>
          <PasteList
            pastes={pasteWithSameDate}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      // Should not show "Updated:" text
      expect(screen.queryByText("Updated:")).not.toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("should create correct navigation links to paste views", () => {
      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/p/test.bsky.social/test123");
      expect(links[1]).toHaveAttribute("href", "/p/test.bsky.social/test456");
    });

    it("should handle URIs that cannot be parsed", async () => {
      const pdsUtilsModule = await import("../../utils/pdsUtils");
      vi.mocked(pdsUtilsModule.parseAtUri).mockReturnValue(null);

      const pastesWithBadUri = [
        {
          ...mockPastes[0],
          uri: "invalid-uri/some/path/rkey789",
        },
      ];

      render(
        <TestWrapper>
          <PasteList
            pastes={pastesWithBadUri}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/p/test.bsky.social/rkey789");

      // Restore the mock so it doesn't affect other tests
      vi.mocked(pdsUtilsModule.parseAtUri).mockRestore();
    });
  });

  describe("ownership and edit/delete buttons", () => {
    it("should show edit and delete buttons for own pastes", () => {
      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole("button", {
        name: /Delete this paste/i,
      });
      const editButtons = screen.getAllByRole("button", {
        name: /Edit this paste/i,
      });

      expect(deleteButtons).toHaveLength(2);
      expect(editButtons).toHaveLength(2);
    });

    it("should not show edit/delete buttons for other users pastes", () => {
      const currentUserSession = {
        handle: "different.bsky.social",
        did: "did:plc:different",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      expect(
        screen.queryByRole("button", { name: /Delete this paste/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Edit this paste/i }),
      ).not.toBeInTheDocument();
    });

    it("should not show edit/delete buttons when not authenticated", () => {
      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(
        screen.queryByRole("button", { name: /Delete this paste/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Edit this paste/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("delete functionality", () => {
    it("should call deletePaste when delete button is clicked", () => {
      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole("button", {
        name: /Delete this paste/i,
      });
      fireEvent.click(deleteButtons[0]);

      expect(mockDeletePaste).toHaveBeenCalledWith(mockPastes[0].uri);
    });

    it("should show delete loading state", async () => {
      const useDeletePasteModule = await import("../../hooks/useDeletePaste");
      vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
        deletePaste: mockDeletePaste,
        loading: true,
        error: null,
      });

      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      // Loading state should be reflected in the button
      const deleteButtons = screen.getAllByRole("button", {
        name: /Delete this paste/i,
      });
      expect(deleteButtons[0]).toBeInTheDocument();
    });

    it("should display delete error when present", async () => {
      const useDeletePasteModule = await import("../../hooks/useDeletePaste");
      vi.mocked(useDeletePasteModule.useDeletePaste).mockReturnValue({
        deletePaste: mockDeletePaste,
        loading: false,
        error: "Failed to delete paste",
      });

      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const errorMessages = screen.getAllByText(
        "Error: Failed to delete paste",
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe("edit functionality", () => {
    it("should set edit form when edit button is clicked", () => {
      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const editButtons = screen.getAllByRole("button", {
        name: /Edit this paste/i,
      });
      fireEvent.click(editButtons[0]);

      expect(mockSetEditForm).toHaveBeenCalledWith({
        uri: mockPastes[0].uri,
        originalRecord: mockPastes[0].value,
        title: mockPastes[0].value.title,
        content: mockPastes[0].content,
        language: mockPastes[0].value.language,
      });
    });

    it("should handle edit form for paste without title", () => {
      const pasteWithoutTitle = {
        ...mockPastes[0],
        value: { ...mockPastes[0].value, title: undefined },
      };

      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={[pasteWithoutTitle]}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const editButton = screen.getByRole("button", {
        name: /Edit this paste/i,
      });
      fireEvent.click(editButton);

      expect(mockSetEditForm).toHaveBeenCalledWith({
        uri: pasteWithoutTitle.uri,
        originalRecord: pasteWithoutTitle.value,
        title: "",
        content: pasteWithoutTitle.content,
        language: pasteWithoutTitle.value.language,
      });
    });

    it("should handle edit form for paste without language", () => {
      const pasteWithoutLanguage = {
        ...mockPastes[0],
        value: { ...mockPastes[0].value, language: undefined },
      };

      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={[pasteWithoutLanguage]}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const editButton = screen.getByRole("button", {
        name: /Edit this paste/i,
      });
      fireEvent.click(editButton);

      expect(mockSetEditForm).toHaveBeenCalledWith({
        uri: pasteWithoutLanguage.uri,
        originalRecord: pasteWithoutLanguage.value,
        title: pasteWithoutLanguage.value.title,
        content: pasteWithoutLanguage.content,
        language: "text",
      });
    });

    it("should display update error when present", async () => {
      const useUpdatePasteModule = await import("../../hooks/useUpdatePaste");
      vi.mocked(useUpdatePasteModule.useUpdatePaste).mockReturnValue({
        updatePaste: mockUpdatePaste,
        loading: false,
        error: "Failed to update paste",
      });

      const currentUserSession = {
        handle: "test.bsky.social",
        did: "did:plc:test",
      };

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={currentUserSession}
          />
        </TestWrapper>,
      );

      const errorMessages = screen.getAllByText(
        "Error: Failed to update paste",
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe("edit modal integration", () => {
    it("should not show edit modal when no edit form is set", () => {
      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
    });

    it("should show edit modal when edit form is set", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm: {
          uri: "test-uri",
          title: "Test",
          content: "test content",
          language: "javascript",
          originalRecord: {
            $type: "moe.karashiiro.kpaste.paste",
            title: "Test",
            language: "javascript",
            createdAt: "2024-01-01T10:00:00Z",
            content: {
              $type: "blob",
              ref: { $link: "blob123" },
              mimeType: "text/plain",
              size: 100,
            },
          },
        },
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
        showCreateForm: false,
        setShowCreateForm: vi.fn(),
        createForm: {
          title: "",
          content: "",
          language: "",
        },
        setCreateForm: vi.fn(),
        resetForm: vi.fn(),
      });

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
    });

    it("should call updatePaste when modal submit is clicked", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      const mockEditForm = {
        uri: "test-uri",
        title: "Test",
        content: "test content",
        language: "javascript",
        originalRecord: {
          $type: "moe.karashiiro.kpaste.paste",
          title: "Test",
          language: "javascript",
          createdAt: "2024-01-01T10:00:00Z",
          content: {
            $type: "blob",
            ref: { $link: "blob123" },
            mimeType: "text/plain",
            size: 100,
          },
        },
      } as const;

      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm: mockEditForm,
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
        showCreateForm: false,
        setShowCreateForm: vi.fn(),
        createForm: {
          title: "",
          content: "",
          language: "",
        },
        setCreateForm: vi.fn(),
        resetForm: vi.fn(),
      });

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      const submitButton = screen.getByText("Submit");
      fireEvent.click(submitButton);

      expect(mockUpdatePaste).toHaveBeenCalledWith(mockEditForm);
    });

    it("should call cancelEdit when modal close is clicked", async () => {
      const usePasteFormModule = await import("../../hooks/usePasteForm");
      vi.mocked(usePasteFormModule.usePasteForm).mockReturnValue({
        editForm: {
          uri: "test-uri",
          title: "Test",
          originalRecord: {
            $type: "moe.karashiiro.kpaste.paste",
            title: "Test",
            language: "javascript",
            createdAt: "2024-01-01T10:00:00Z",
            content: {
              $type: "blob",
              ref: { $link: "blob123" },
              mimeType: "text/plain",
              size: 100,
            },
          },
          content: "",
          language: "",
        },
        setEditForm: mockSetEditForm,
        cancelEdit: mockCancelEdit,
        showCreateForm: false,
        setShowCreateForm: vi.fn(),
        createForm: {
          title: "Test",
          content: "test content",
          language: "javascript",
        },
        setCreateForm: vi.fn(),
        resetForm: vi.fn(),
      });

      render(
        <TestWrapper>
          <PasteList
            pastes={mockPastes}
            userHandle="test.bsky.social"
            currentUserSession={null}
          />
        </TestWrapper>,
      );

      const closeButton = screen.getByText("Close");
      fireEvent.click(closeButton);

      expect(mockCancelEdit).toHaveBeenCalled();
    });
  });
});
