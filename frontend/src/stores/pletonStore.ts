import { create } from "zustand";

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

const DEFAULT_PLETONS: PletonData[] = [
  { id: 1, nama: "SMP N 2 Tegal", bidang: "No. 01 - SMP N 2 Tegal", email: "smpn2tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+2+Tegal", category_id: 1 },
  { id: 2, nama: "SMP N 5 Tegal", bidang: "No. 02 - SMP N 5 Tegal", email: "smpn5tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+5+Tegal", category_id: 1 },
  { id: 3, nama: "SMP N 7 Tegal", bidang: "No. 03 - SMP N 7 Tegal", email: "smpn7tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+7+Tegal", category_id: 1 },
  { id: 4, nama: "SMP N 10 Tegal", bidang: "No. 04 - SMP N 10 Tegal", email: "smpn10tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+10+Tegal", category_id: 1 },
  { id: 5, nama: "Mts Tegal", bidang: "No. 05 - Mts Tegal", email: "mtstegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=Mts+Tegal", category_id: 1 },
  { id: 6, nama: "SMA N 1 Tegal", bidang: "No. 01 - SMA N 1 Tegal", email: "sman1tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+1+Tegal", category_id: 2 },
  { id: 7, nama: "SMA N 3 Tegal", bidang: "No. 02 - SMA N 3 Tegal", email: "sman3tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+3+Tegal", category_id: 2 },
  { id: 8, nama: "SMA N 4 Tegal", bidang: "No. 03 - SMA N 4 Tegal", email: "sman4tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+4+Tegal", category_id: 2 },
  { id: 9, nama: "SMA N 5 Tegal Tim A", bidang: "No. 04 - SMA N 5 Tegal", email: "sman5tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+5+Tegal+Tim+A", category_id: 2 },
  { id: 10, nama: "SMAN 5 Tegal Tim B", bidang: "No. 05 - SMAN 5 Tegal", email: "sman5btegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMAN+5+Tegal+Tim+B", category_id: 2 },
  { id: 11, nama: "SMK N 1 Tegal", bidang: "No. 06 - SMK N 1 Tegal", email: "smkn1tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+1+Tegal", category_id: 2 },
  { id: 12, nama: "SMK N 2 Tegal", bidang: "No. 07 - SMK N 2 Tegal", email: "smkn2tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+2+Tegal", category_id: 2 },
  { id: 13, nama: "SMK N 3 Tegal Tim A", bidang: "No. 08 - SMK N 3 Tegal", email: "smkn3tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+3+Tegal+Tim+A", category_id: 2 },
  { id: 14, nama: "SMK N 3 Tegal Tim B", bidang: "No. 09 - SMK N 3 Tegal", email: "smkn3btegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+3+Tegal+Tim+B", category_id: 2 },
  { id: 15, nama: "SMK Muhammadiyah 1 Tegal", bidang: "No. 10 - SMK Muhammadiyah 1 Tegal", email: "smkmuh1tegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+Muhammadiyah+1+Tegal", category_id: 2 },
  { id: 16, nama: "SMK Harber Tegal", bidang: "No. 11 - SMK Harber Tegal", email: "smkharbertegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+Harber+Tegal", category_id: 2 },
  { id: 17, nama: "SUPM Tegal", bidang: "No. 12 - SUPM Tegal", email: "supmtegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SUPM+Tegal", category_id: 2 },
  { id: 18, nama: "SMA Muhammadiyah Tegal", bidang: "No. 13 - SMA Muhammadiyah Tegal", email: "smamuhtegal@gmail.com", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+Muhammadiyah+Tegal", category_id: 2 }
];

const getStoredPletons = (): PletonData[] => {
  const stored = localStorage.getItem("dummy_pletons");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_PLETONS;
};

const savePletons = (list: PletonData[]) => {
  localStorage.setItem("dummy_pletons", JSON.stringify(list));
};

export const usePletonStore = create<PletonState>((set, get) => ({
  pletonList: getStoredPletons(),
  loading: false,

  fetchPleton: async () => {
    set({ loading: true });
    set({ pletonList: getStoredPletons(), loading: false });
  },

  addPleton: async (formData) => {
    const list = get().pletonList;
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const newItem: PletonData = { id: newId, ...formData };
    const updated = [...list, newItem];
    savePletons(updated);
    set({ pletonList: updated });
    return true;
  },

  deletePleton: async (id) => {
    const updated = get().pletonList.filter(p => p.id !== id);
    savePletons(updated);
    set({ pletonList: updated });
    return true;
  },

  updatePleton: async (id, formData) => {
    const updated = get().pletonList.map(p => p.id === id ? { ...p, ...formData } : p);
    savePletons(updated);
    set({ pletonList: updated });
    return true;
  },
}));

// Backwards compatibility aliases
export const usePembicaraStore = usePletonStore;
export const useSpeakerStore = usePletonStore;