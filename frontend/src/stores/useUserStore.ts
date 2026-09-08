import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  password?: string;
  role?: string;
}

interface UserState {
  userList: UserAdmin[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<UserAdmin, "id">) => Promise<boolean>;
  updateUser: (id: string, updated: Omit<UserAdmin, "id">) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  userList: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users`);
      set({ userList: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      set({ loading: false });
    }
  },

  addUser: async (user) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/users`, user);
      set({ userList: [...get().userList, res.data] });
      return true;
    } catch (error) {
      console.error("Gagal menambah user admin:", error);
      return false;
    }
  },

  updateUser: async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/auth/users/${id}`, updatedData);
      set({ userList: get().userList.map(u => u.id === id ? { ...u, ...res.data } : u) });
      return true;
    } catch (error) {
      console.error("Gagal memperbarui user admin:", error);
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/users/${id}`);
      set({ userList: get().userList.filter(u => u.id !== id) });
      return true;
    } catch (error) {
      console.error("Gagal menghapus user admin:", error);
      return false;
    }
  },
}));
