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
  addTransaction: (cart: { id: number; name: string; qty: number; price: number }[]) => Promise<{ transactionCode: string; grandTotal: number; kodeUnik: number } | null>;
  approveTransaction: (transactionCode: string) => Promise<boolean>;
  deleteTransaction: (transactionCode: string) => Promise<boolean>;
  addOfflineVote: (finalistId: number, namaKlub: string, votesCount: number, voterEmail?: string) => Promise<boolean>;
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

  addTransaction: async (cart) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/votes/request-payment`, { cart });
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
      await axios.post(`${API_BASE_URL}/votes/finalize-payment`, { transactionCode });
      // Refresh transactions list
      await get().fetchTransactions();
      return true;
    } catch (error) {
      console.error("Gagal memverifikasi transaksi:", error);
      return false;
    }
  },

  deleteTransaction: async (transactionCode: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/votes/transactions/${transactionCode}`);
      set({ transactions: get().transactions.filter(tx => tx.id !== transactionCode) });
      return true;
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
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
      // Refresh transactions list
      await get().fetchTransactions();
      return true;
    } catch (error) {
      console.error("Gagal submit vote offline:", error);
      return false;
    }
  }
}));
