import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface VoteTransaction {
  id: string;
  date: string;
  namaKlub: string;
  voterEmail: string;
  votesCount: number;
  amount: number;
  kodeUnik?: number;
  grandTotal?: number;
  status: "Lunas" | "Pending" | "Batal" | string;
  createdAt?: string;
}

interface TransactionState {
  transactions: VoteTransaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (cart: { id: number; name: string; qty: number; price: number }[], transactionCode?: string) => Promise<{ transactionCode: string; grandTotal: number; kodeUnik: number } | null>;
  approveTransaction: (transactionCode: string) => Promise<boolean>;
  deleteTransaction: (transactionCode: string) => Promise<boolean>;
  bulkDeleteTransactions: (codes: string[]) => Promise<boolean>;
  addOfflineVote: (finalistId: number, namaKlub: string, votesCount: number, voterEmail?: string) => Promise<boolean>;
  createDokuPayment: (params: { teamId?: number; quantity?: number; cart?: any[]; voterEmail?: string }) => Promise<{ invoiceId: string; amount: number; status: string; qrContent: string; expiresAt: string } | null>;
  checkDokuPaymentStatus: (invoiceId: string) => Promise<{ invoiceId: string; status: string } | null>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  fetchTransactions: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/votes/transactions`);
      set({ transactions: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    }
  },

  addTransaction: async (cart, transactionCode) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/votes/request-payment`, { cart, transactionCode });
      return {
        transactionCode: res.data.transactionCode,
        grandTotal: res.data.grandTotal,
        kodeUnik: res.data.kodeUnik,
      };
    } catch (error) {
      console.error("Gagal membuat transaksi:", error);
      return null;
    }
  },

  approveTransaction: async (transactionCode: string) => {
    try {
      // Optimistic update: ubah status di local state dulu agar UI instan
      set({
        transactions: get().transactions.map(tx =>
          tx.id.includes(transactionCode) ? { ...tx, status: "Lunas" } : tx
        )
      });
      await axios.post(`${API_BASE_URL}/votes/finalize-payment`, { transactionCode });
      // Sync di background tanpa await agar tidak block UI
      get().fetchTransactions();
      return true;
    } catch (error) {
      console.error("Gagal memverifikasi transaksi:", error);
      // Rollback jika gagal
      get().fetchTransactions();
      return false;
    }
  },

  deleteTransaction: async (transactionCode: string) => {
    try {
      // Optimistic update: hapus dari local state dulu
      set({
        transactions: get().transactions.filter(tx => !tx.id.includes(transactionCode))
      });
      await axios.delete(`${API_BASE_URL}/votes/transactions/${transactionCode}`);
      return true;
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      // Rollback jika gagal
      get().fetchTransactions();
      return false;
    }
  },

  bulkDeleteTransactions: async (codes: string[]) => {
    try {
      // Optimistic update: hapus semua kode terpilih dari local state
      set({
        transactions: get().transactions.filter(tx => {
          const pCode = tx.id.startsWith("TX-") ? tx.id.split("-").slice(2).join("-") : tx.id;
          return !codes.includes(pCode) && !codes.includes(tx.id);
        })
      });
      await axios.post(`${API_BASE_URL}/votes/transactions/bulk-delete`, { codes });
      get().fetchTransactions();
      return true;
    } catch (error) {
      console.error("Gagal menghapus transaksi massal:", error);
      get().fetchTransactions();
      return false;
    }
  },

  addOfflineVote: async (finalistId: number, namaKlub: string, votesCount: number, voterEmail = "offline@forbasi.org") => {
    try {
      await axios.post(`${API_BASE_URL}/votes/offline`, {
        finalistId,
        votesCount,
        voterEmail
      });
      // Sync di background
      get().fetchTransactions();
      return true;
    } catch (error) {
      console.error("Gagal submit vote offline:", error);
      return false;
    }
  },

  createDokuPayment: async (params) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/payment/doku/create`, params);
      return res.data;
    } catch (error) {
      console.error("Gagal membuat DOKU payment:", error);
      return null;
    }
  },

  checkDokuPaymentStatus: async (invoiceId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/payment/status/${invoiceId}`);
      return res.data;
    } catch (error) {
      console.error("Gagal mengecek status DOKU payment:", error);
      return null;
    }
  }
}));
