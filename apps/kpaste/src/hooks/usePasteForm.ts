import { useState, useCallback } from "react";
import type { Main as PasteRecord } from "@kpaste-app/lexicon/types";

export interface CreatePasteForm {
  title: string;
  content: string;
  language: string;
}

export interface EditPasteForm extends CreatePasteForm {
  uri: string;
  originalRecord: PasteRecord;
}

const defaultCreateForm: CreatePasteForm = {
  title: "",
  content: "",
  language: "text",
};

export function usePasteForm() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreatePasteForm>(defaultCreateForm);
  const [editForm, setEditForm] = useState<EditPasteForm | null>(null);

  const resetForm = useCallback(() => {
    setCreateForm(defaultCreateForm);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditForm(null);
  }, []);

  return {
    showCreateForm,
    setShowCreateForm,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    resetForm,
    cancelEdit,
  };
}
