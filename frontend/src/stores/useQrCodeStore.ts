import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface QrCode {
  id: string | number;
  name: string;
  image: string; // Base64 data URL or external URL
  description: string;
  status: "Aktif" | "Non-Aktif" | string;
}

interface QrState {
  qrList: QrCode[];
  loading: boolean;
  fetchQrCodes: () => Promise<void>;
  addQrCode: (qr: Omit<QrCode, "id">) => Promise<void>;
  updateQrCode: (id: string | number, updated: Omit<QrCode, "id">) => Promise<void>;
  deleteQrCode: (id: string | number) => Promise<void>;
}

export const useQrCodeStore = create<QrState>((set, get) => ({
  qrList: [],
  loading: false,

  fetchQrCodes: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/qrcodes`);
      set({ qrList: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Gagal mengambil QR codes:", error);
      set({ loading: false });
    }
  },

  addQrCode: async (qr) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/qrcodes`, qr);
      set({ qrList: [...get().qrList, res.data] });
    } catch (error) {
      console.error("Gagal menambah QR code:", error);
      throw error;
    }
  },

  updateQrCode: async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/qrcodes/${id}`, updatedData);
      set({ qrList: get().qrList.map(q => q.id === id ? { ...q, ...res.data } : q) });
    } catch (error) {
      console.error("Gagal memperbarui QR code:", error);
      throw error;
    }
  },

  deleteQrCode: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/qrcodes/${id}`);
      set({ qrList: get().qrList.filter(q => q.id !== id) });
    } catch (error) {
      console.error("Gagal menghapus QR code:", error);
      throw error;
    }
  }
}));
