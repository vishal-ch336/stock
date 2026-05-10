import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  darkMode: boolean;
  sseConnected: boolean;
  tokenReady: boolean;
  toggleDarkMode: () => void;
  setSSEConnected: (connected: boolean) => void;
  setTokenReady: (ready: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      sseConnected: false,
      tokenReady: false,

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

      setSSEConnected: (connected) => {
        set({ sseConnected: connected });
      },

      setTokenReady: (ready) => {
        set({ tokenReady: ready });
      },
    }),
    {
      name: "sungrid-ui-prefs",
      partialize: (state) => ({ darkMode: state.darkMode }),
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

