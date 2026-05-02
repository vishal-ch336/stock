import { create } from "zustand";
import { Movement } from "@/types";
import { dataConnector } from "@/lib/dataConnector";

interface MovementsState {
  movements: Movement[];
  loading: boolean;
  error: string | null;
  fetchMovements: (params?: any) => Promise<void>;
  prependMovement: (movement: Movement) => void;
}

export const useMovementsStore = create<MovementsState>((set) => ({
  movements: [],
  loading: false,
  error: null,

  fetchMovements: async (params) => {
    set({ loading: true, error: null });
    try {
      const movements = await dataConnector.listMovements(params);
      set({ movements, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  prependMovement: (movement) => {
    set((state) => ({
      movements: [movement, ...state.movements].slice(0, 100),
    }));
  },
}));
