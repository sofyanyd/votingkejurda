import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface PletonData {
  id: number;
  nama: string;
  bidang: string; 
  email: string; 
  foto_url?: string;
  category_id?: number;
}

interface PletonState {
  pletonList: PletonData[]; 
  loading: boolean;
  fetchPleton: () => Promise<void>; 
  addPleton: (formData: Omit<PletonData, "id">) => Promise<boolean>;
  deletePleton: (id: number) => Promise<boolean>;
  updatePleton: (id: number, formData: Omit<PletonData, "id">) => Promise<boolean>;
}

export const usePletonStore = create<PletonState>((set, get) => ({
  pletonList: [],
  loading: false,

  fetchPleton: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/speakers`);
      set({ pletonList: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Gagal mengambil data pleton:", error);
      set({ loading: false });
    }
  },

  addPleton: async (formData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/speakers`, formData);
      set({ pletonList: [...get().pletonList, res.data] });
      return true;
    } catch (error) {
      console.error("Gagal menambah pleton:", error);
      return false;
    }
  },

  deletePleton: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/speakers/${id}`);
      set({ pletonList: get().pletonList.filter(p => p.id !== id) });
      return true;
    } catch (error) {
      console.error("Gagal menghapus pleton:", error);
      return false;
    }
  },

  updatePleton: async (id, formData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/speakers/${id}`, formData);
      set({ pletonList: get().pletonList.map(p => p.id === id ? { ...p, ...res.data } : p) });
      return true;
    } catch (error) {
      console.error("Gagal memperbarui pleton:", error);
      return false;
    }
  },
}));

// Backwards compatibility aliases
export const usePembicaraStore = usePletonStore;
export const useSpeakerStore = usePletonStore;