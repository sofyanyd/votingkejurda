import { create } from "zustand";

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

const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: 1, nama: "SMP Sederajat", deskripsi: "Kategori Lomba untuk Pleton tingkat SMP / MTs sederajat" },
  { id: 2, nama: "SMA/SMK/MA Sederajat", deskripsi: "Kategori Lomba untuk Pleton tingkat SMA / SMK / MA sederajat" }
];

const getStoredCategories = (): CategoryData[] => {
  const stored = localStorage.getItem("dummy_categories");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_CATEGORIES;
};

const saveCategories = (cats: CategoryData[]) => {
  localStorage.setItem("dummy_categories", JSON.stringify(cats));
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: getStoredCategories(),
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    set({ categories: getStoredCategories(), loading: false });
  },

  addCategory: async (formData) => {
    const list = get().categories;
    const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newItem: CategoryData = { id: newId, ...formData };
    const updated = [...list, newItem];
    saveCategories(updated);
    set({ categories: updated });
    return true;
  },

  deleteCategory: async (id) => {
    const updated = get().categories.filter(c => c.id !== id);
    saveCategories(updated);
    set({ categories: updated });
    return true;
  },

  updateCategory: async (id, formData) => {
    const updated = get().categories.map(c => c.id === id ? { ...c, ...formData } : c);
    saveCategories(updated);
    set({ categories: updated });
    return true;
  },
}));