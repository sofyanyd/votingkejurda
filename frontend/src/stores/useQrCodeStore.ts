import { create } from "zustand";

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

const DEFAULT_QR_CODES: QrCode[] = [
  {
    id: 1,
    name: "QRIS FORBASI Tegal",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='200' height='200'><rect width='100' height='100' fill='%23ffffff'/><path d='M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z' fill='%23000000'/><path d='M15 15h20v20H15zM65 15h20v20H65zM15 65h20v20H15z' fill='%23ffffff'/><path d='M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z' fill='%23000000'/><path d='M45 10h10v40H45zM10 45h40v10H10zM55 55h35v35H55z' fill='%23000000'/></svg>",
    description: "Scan QRIS ini menggunakan m-Banking atau E-Wallet (Gopay, OVO, Dana, LinkAja, ShopeePay)",
    status: "Aktif"
  }
];

const getStoredQrCodes = (): QrCode[] => {
  const stored = localStorage.getItem("dummy_qrcodes");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_QR_CODES;
};

const saveQrCodes = (qrs: QrCode[]) => {
  localStorage.setItem("dummy_qrcodes", JSON.stringify(qrs));
};

export const useQrCodeStore = create<QrState>((set, get) => ({
  qrList: getStoredQrCodes(),
  loading: false,

  fetchQrCodes: async () => {
    set({ loading: true });
    set({ qrList: getStoredQrCodes(), loading: false });
  },

  addQrCode: async (qr) => {
    const list = get().qrList;
    const newId = Date.now();
    const newItem: QrCode = { id: newId, ...qr };
    const updated = [...list, newItem];
    saveQrCodes(updated);
    set({ qrList: updated });
  },

  updateQrCode: async (id, updatedData) => {
    const updated = get().qrList.map(q => q.id === id ? { ...q, ...updatedData } : q);
    saveQrCodes(updated);
    set({ qrList: updated });
  },

  deleteQrCode: async (id) => {
    const updated = get().qrList.filter(q => q.id !== id);
    saveQrCodes(updated);
    set({ qrList: updated });
  }
}));
