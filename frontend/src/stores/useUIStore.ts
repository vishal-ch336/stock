import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  darkMode: boolean;
  managerMode: boolean;
  sseConnected: boolean;
  toggleDarkMode: () => void;
  toggleManagerMode: () => void;
  setSSEConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      managerMode: false,
      sseConnected: false,

      toggleDarkMode: () => {
        set((state) => {
          const newMode = !state.darkMode;
          if (newMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: newMode };
        });
      },

      toggleManagerMode: () => {
        set((state) => ({ managerMode: !state.managerMode }));
      },

      setSSEConnected: (connected) => {
        set({ sseConnected: connected });
      },
    }),
    {
      name: "sungrid-ui-prefs",
      partialize: (state) => ({ darkMode: state.darkMode, managerMode: state.managerMode }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem("sungrid-ui-prefs");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.darkMode) {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}
