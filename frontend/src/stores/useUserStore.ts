import { create } from "zustand";

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

const DEFAULT_USERS: UserAdmin[] = [
  { id: "1", username: "Administrator", email: "admin@gmail.com", password: "12345678", role: "admin" },
  { id: "2", username: "Pranada Alfath", email: "pranadaalfath@gmail.com", password: "24090027", role: "voter" }
];

const getStoredUsers = (): UserAdmin[] => {
  const stored = localStorage.getItem("dummy_users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_USERS;
};

const saveUsers = (users: UserAdmin[]) => {
  localStorage.setItem("dummy_users", JSON.stringify(users));
};

export const useUserStore = create<UserState>((set, get) => ({
  userList: getStoredUsers(),
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    set({ userList: getStoredUsers(), loading: false });
  },

  addUser: async (user) => {
    const list = get().userList;
    const newId = String(Date.now());
    const newItem: UserAdmin = { id: newId, role: "admin", ...user };
    const updated = [...list, newItem];
    saveUsers(updated);
    set({ userList: updated });
    return true;
  },

  updateUser: async (id, updatedData) => {
    const updated = get().userList.map(u => u.id === id ? { ...u, ...updatedData } : u);
    saveUsers(updated);
    set({ userList: updated });
    return true;
  },

  deleteUser: async (id) => {
    const updated = get().userList.filter(u => u.id !== id);
    saveUsers(updated);
    set({ userList: updated });
    return true;
  },
}));
