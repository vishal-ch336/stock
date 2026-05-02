import { create } from "zustand";
import { OverviewStats, TopSku, DailyNetData } from "@/types";
import { dataConnector } from "@/lib/dataConnector";

interface StatsState {
  overview: OverviewStats | null;
  topSkus: TopSku[];
  dailyNet: DailyNetData[];
  loading: boolean;
  fetchOverview: () => Promise<void>;
  fetchTopSkus: (limit?: number) => Promise<void>;
  fetchDailyNet: (days?: number) => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  overview: null,
  topSkus: [],
  dailyNet: [],
  loading: false,

  fetchOverview: async () => {
    set({ loading: true });
    try {
      const overview = await dataConnector.getOverviewStats();
      set({ overview, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchTopSkus: async (limit = 5) => {
    try {
      const topSkus = await dataConnector.getTopSkus(limit);
      set({ topSkus });
    } catch (error) {
      console.error("Failed to fetch top SKUs:", error);
    }
  },

  fetchDailyNet: async (days = 30) => {
    try {
      const dailyNet = await dataConnector.getDailyNet(days);
      set({ dailyNet });
    } catch (error) {
      console.error("Failed to fetch daily net:", error);
    }
  },
}));
