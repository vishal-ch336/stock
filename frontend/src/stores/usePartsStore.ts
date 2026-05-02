import { create } from "zustand";
import { Part } from "@/types";
import { dataConnector } from "@/lib/dataConnector";

interface PartsState {
  parts: Part[];
  loading: boolean;
  error: string | null;
  fetchParts: (params?: any) => Promise<void>;
  upsertPart: (part: Part) => void;
  deletePart: (partId: string) => void;
}

export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  loading: false,
  error: null,

  fetchParts: async (params) => {
    set({ loading: true, error: null });
    try {
      const parts = await dataConnector.listParts(params);
      set({ parts, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  upsertPart: (part) => {
    set((state) => {
      const existing = state.parts.findIndex((p) => p.partId === part.partId);
      if (existing >= 0) {
        const updated = [...state.parts];
        updated[existing] = part;
        return { parts: updated };
      }
      return { parts: [part, ...state.parts] };
    });
  },

  deletePart: (partId) => {
    set((state) => ({
      parts: state.parts.filter((p) => p.partId !== partId),
    }));
  },
}));
