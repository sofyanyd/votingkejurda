import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface LeaderboardState {
  standings: any[];
  loading: boolean;
  fetchLeaderboard: (force?: boolean) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  standings: [],
  loading: false,

  fetchLeaderboard: async (force = false) => {
    if (get().standings.length === 0 || force) {
      set({ loading: true });
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/votes/leaderboard`);
      set({ standings: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Gagal mengambil data leaderboard:", error);
      set({ loading: false });
    }
  }
}));
