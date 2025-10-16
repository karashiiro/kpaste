import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  usePasteForm,
  type CreatePasteForm,
  type EditPasteForm,
} from "./usePasteForm";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";

describe("usePasteForm", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePasteForm());

    expect(result.current.showCreateForm).toBe(false);
    expect(result.current.createForm).toEqual({
      title: "",
      content: "",
      language: "text",
    });
    expect(result.current.editForm).toBe(null);
  });

  it("should toggle showCreateForm state", () => {
    const { result } = renderHook(() => usePasteForm());

    expect(result.current.showCreateForm).toBe(false);

    act(() => {
      result.current.setShowCreateForm(true);
    });

    expect(result.current.showCreateForm).toBe(true);

    act(() => {
      result.current.setShowCreateForm(false);
    });

    expect(result.current.showCreateForm).toBe(false);
  });

  it("should update createForm state", () => {
    const { result } = renderHook(() => usePasteForm());

    const newForm: CreatePasteForm = {
      title: "Test Paste",
      content: "console.log('hello');",
      language: "javascript",
    };

    act(() => {
      result.current.setCreateForm(newForm);
    });

    expect(result.current.createForm).toEqual(newForm);
  });

  it("should reset createForm to default values", () => {
    const { result } = renderHook(() => usePasteForm());

    // Set some values first
    act(() => {
      result.current.setCreateForm({
        title: "Test",
        content: "test content",
        language: "python",
      });
    });

    expect(result.current.createForm.title).toBe("Test");

    // Reset the form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.createForm).toEqual({
      title: "",
      content: "",
      language: "text",
    });
  });

  it("should manage editForm state", () => {
    const { result } = renderHook(() => usePasteForm());

    const mockPasteRecord: PasteRecord = {
      $type: "moe.karashiiro.kpaste.paste",
      content: {
        $type: "blob",
        mimeType: "text/plain",
        size: 100,
        ref: { $link: "bafkreitest" },
      },
      title: "Original Title",
      language: "typescript",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const editForm: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      title: "Edit Test",
      content: "edited content",
      language: "javascript",
      originalRecord: mockPasteRecord,
    };

    expect(result.current.editForm).toBe(null);

    act(() => {
      result.current.setEditForm(editForm);
    });

    expect(result.current.editForm).toEqual(editForm);
  });

  it("should cancel edit and clear editForm", () => {
    const { result } = renderHook(() => usePasteForm());

    const mockPasteRecord: PasteRecord = {
      $type: "moe.karashiiro.kpaste.paste",
      content: {
        $type: "blob",
        mimeType: "text/plain",
        size: 100,
        ref: { $link: "bafkreitest" },
      },
      title: "Test",
      language: "text",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const editForm: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      title: "Test",
      content: "content",
      language: "text",
      originalRecord: mockPasteRecord,
    };

    // Set edit form first
    act(() => {
      result.current.setEditForm(editForm);
    });

    expect(result.current.editForm).toEqual(editForm);

    // Cancel edit
    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editForm).toBe(null);
  });

  it("should maintain independent state for createForm and editForm", () => {
    const { result } = renderHook(() => usePasteForm());

    const createForm: CreatePasteForm = {
      title: "Create Title",
      content: "create content",
      language: "python",
    };

    const mockPasteRecord: PasteRecord = {
      $type: "moe.karashiiro.kpaste.paste",
      content: {
        $type: "blob",
        mimeType: "text/plain",
        size: 100,
        ref: { $link: "bafkreitest" },
      },
      title: "Original",
      language: "javascript",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const editForm: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      title: "Edit Title",
      content: "edit content",
      language: "javascript",
      originalRecord: mockPasteRecord,
    };

    act(() => {
      result.current.setCreateForm(createForm);
      result.current.setEditForm(editForm);
    });

    expect(result.current.createForm).toEqual(createForm);
    expect(result.current.editForm).toEqual(editForm);

    // Resetting createForm should not affect editForm
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.createForm).toEqual({
      title: "",
      content: "",
      language: "text",
    });
    expect(result.current.editForm).toEqual(editForm); // Should remain unchanged
  });
});
