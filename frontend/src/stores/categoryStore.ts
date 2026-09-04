import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface CategoryData {
  id: number;
  nama: string;
  deskripsi?: string;
}

interface CategoryState {
  categories: CategoryData[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (formData: Omit<CategoryData, "id">) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  updateCategory: (id: number, formData: Omit<CategoryData, "id">) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      set({ categories: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Gagal mengambil data kategori:", error);
      set({ loading: false });
    }
  },

  addCategory: async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/categories`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ categories: [...get().categories, res.data] });
      return true;
    } catch (error) {
      console.error("Gagal menambah kategori:", error);
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ categories: get().categories.filter(c => c.id !== id) });
      return true;
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      return false;
    }
  },

  updateCategory: async (id, formData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE_URL}/categories/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ categories: get().categories.map(c => c.id === id ? { ...c, ...res.data } : c) });
      return true;
    } catch (error) {
      console.error("Gagal memperbarui kategori:", error);
      return false;
    }
  },
}));