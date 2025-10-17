import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { PasteListPage } from "./PasteListPage";
import type { PasteListItem } from "../../types";

const config = createTamagui(defaultConfig);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

// Mock all the dependencies
vi.mock("react-router", () => ({
  useLoaderData: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock("@kpaste-app/atproto-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../paste/PasteList", () => ({
  PasteList: vi.fn(() => <div data-testid="paste-list">Paste List</div>),
}));

vi.mock("../paste/PasteListPaginationButtons", () => ({
  PasteListPaginationButtons: vi.fn(() => (
    <div data-testid="pagination-buttons">Pagination</div>
  )),
}));

vi.mock("@kpaste-app/ui", async () => {
  const actual = await vi.importActual("@kpaste-app/ui");
  return {
    ...actual,
    PageContainer: vi.fn(({ children }) => <div>{children}</div>),
  };
});

describe("PasteListPage", () => {
  const mockPastes: PasteListItem[] = [
    {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test Paste 1",
        language: "javascript",
        content: {
          $type: "blob",
          ref: { $link: "cid1" },
          mimeType: "text/plain",
          size: 100,
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
      content: "console.log('hello');",
    },
    {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/def456",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test Paste 2",
        language: "python",
        content: {
          $type: "blob",
          ref: { $link: "cid2" },
          mimeType: "text/plain",
          size: 200,
        },
        createdAt: "2024-01-02T00:00:00Z",
      },
      content: "print('world')",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the paste list page with basic structure", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      expect(screen.getByTestId("paste-list")).toBeInTheDocument();
      expect(screen.getAllByTestId("pagination-buttons")).toHaveLength(2);
    });

    it("should render with empty paste list", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: [],
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "empty.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      expect(screen.getByTestId("paste-list")).toBeInTheDocument();
    });

    it("should render nothing when userHandle is undefined", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: undefined,
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Should render empty content (Tamagui wraps it in a span)
      expect(screen.queryByTestId("paste-list")).not.toBeInTheDocument();
    });
  });

  describe("viewing own pastes", () => {
    it("should display 'Your Pastes' when viewing own pastes", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "myhandle.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        session: {
          handle: "myhandle.bsky.social",
          did: "did:plc:myuser",
        },
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      expect(screen.getByText("Your Pastes")).toBeInTheDocument();
      expect(screen.getByText("Manage all your pastes")).toBeInTheDocument();
    });

    it("should pass currentUserSession to PasteList when authenticated", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");
      const { PasteList } = await import("../paste/PasteList");

      const mockSession = {
        handle: "myhandle.bsky.social",
        did: "did:plc:myuser",
      };

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "myhandle.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        session: mockSession,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Just check the first argument (props object)
      const callArgs = (PasteList as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        pastes: mockPastes,
        userHandle: "myhandle.bsky.social",
        currentUserSession: mockSession,
      });
    });
  });

  describe("viewing other user's pastes", () => {
    it("should display other user's handle when viewing their pastes", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "other.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        session: {
          handle: "myhandle.bsky.social",
          did: "did:plc:myuser",
        },
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      expect(
        screen.getByText("other.bsky.social's Pastes"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("View pastes shared by @other.bsky.social"),
      ).toBeInTheDocument();
    });

    it("should display user handle when not authenticated", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "someone.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      expect(
        screen.getByText("someone.bsky.social's Pastes"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("View pastes shared by @someone.bsky.social"),
      ).toBeInTheDocument();
    });

    it("should pass null session to PasteList when not authenticated", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");
      const { PasteList } = await import("../paste/PasteList");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "other.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Just check the first argument (props object)
      const callArgs = (PasteList as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        pastes: mockPastes,
        userHandle: "other.bsky.social",
        currentUserSession: null,
      });
    });
  });

  describe("pagination", () => {
    it("should render pagination buttons twice (top and bottom)", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
        cursor: "cursor123",
        nextCursor: "next456",
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      const paginationButtons = screen.getAllByTestId("pagination-buttons");
      expect(paginationButtons).toHaveLength(2);
    });
  });

  describe("accessibility", () => {
    it("should have proper heading structure", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Main heading should be present
      expect(screen.getByText("test.bsky.social's Pastes")).toBeInTheDocument();
      // Description should be present
      expect(
        screen.getByText("View pastes shared by @test.bsky.social"),
      ).toBeInTheDocument();
    });

    it("should render book icon for visual identification", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // BookOpenIcon should be rendered (check by looking for svg elements)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("component integration", () => {
    it("should pass correct props to PasteList component", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");
      const { PasteList } = await import("../paste/PasteList");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Just check the first argument (props object)
      const callArgs = (PasteList as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toEqual({
        pastes: mockPastes,
        userHandle: "test.bsky.social",
        currentUserSession: null,
      });
    });

    it("should render PageContainer with correct props", async () => {
      const { useLoaderData, useParams } = await import("react-router");
      const { useAuth } = await import("@kpaste-app/atproto-auth");
      const { PageContainer } = await import("@kpaste-app/ui");

      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        pastes: mockPastes,
      });
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        handle: "test.bsky.social",
      });
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        session: null,
      });

      render(
        <TestWrapper>
          <PasteListPage />
        </TestWrapper>,
      );

      // Just check the first argument (props object)
      const callArgs = (PageContainer as ReturnType<typeof vi.fn>).mock
        .calls[0];
      expect(callArgs[0]).toMatchObject({
        flex: 1,
      });
    });
  });
});
