import { create } from "zustand";

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

const DEFAULT_TRANSACTIONS: VoteTransaction[] = [
  {
    id: "TX-LKBB-20260712-001",
    date: "12 Juli 2026, 14:30 WIB",
    namaKlub: "SMA N 1 Tegal",
    voterEmail: "pranadaalfath@gmail.com",
    votesCount: 50,
    amount: 150000,
    kodeUnik: 123,
    grandTotal: 150123,
    status: "Lunas",
    createdAt: "2026-07-12T14:30:00.000Z"
  },
  {
    id: "TX-LKBB-20260712-002",
    date: "12 Juli 2026, 15:10 WIB",
    namaKlub: "SMP N 2 Tegal",
    voterEmail: "budi@gmail.com",
    votesCount: 20,
    amount: 60000,
    kodeUnik: 456,
    grandTotal: 60456,
    status: "Lunas",
    createdAt: "2026-07-12T15:10:00.000Z"
  },
  {
    id: "TX-LKBB-20260712-003",
    date: "12 Juli 2026, 16:00 WIB",
    namaKlub: "SMK N 1 Tegal",
    voterEmail: "siti@gmail.com",
    votesCount: 10,
    amount: 30000,
    kodeUnik: 789,
    grandTotal: 30789,
    status: "Pending",
    createdAt: "2026-07-12T16:00:00.000Z"
  }
];

interface TransactionState {
  transactions: VoteTransaction[];
  fetchTransactions: () => void;
  addTransaction: (tx: Omit<VoteTransaction, "id" | "date">) => string;
  approveTransaction: (transactionCode: string) => boolean;
  deleteTransaction: (transactionCode: string) => boolean;
  addOfflineVote: (namaKlub: string, votesCount: number, voterEmail?: string) => boolean;
}

const getStoredTransactions = (): VoteTransaction[] => {
  const stored = localStorage.getItem("dummy_transactions");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_TRANSACTIONS;
};

const saveTransactions = (txs: VoteTransaction[]) => {
  localStorage.setItem("dummy_transactions", JSON.stringify(txs));
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: getStoredTransactions(),

  fetchTransactions: () => {
    set({ transactions: getStoredTransactions() });
  },

  addTransaction: (newTx) => {
    const code = `TX-LKBB-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";

    const item: VoteTransaction = {
      id: code,
      date: dateStr,
      createdAt: new Date().toISOString(),
      ...newTx
    };

    const updated = [item, ...get().transactions];
    saveTransactions(updated);
    set({ transactions: updated });
    return code;
  },

  approveTransaction: (transactionCode: string) => {
    const updated = get().transactions.map((tx) =>
      tx.id === transactionCode ? { ...tx, status: "Lunas" } : tx
    );
    saveTransactions(updated);
    set({ transactions: updated });
    return true;
  },

  deleteTransaction: (transactionCode: string) => {
    const updated = get().transactions.filter((tx) => tx.id !== transactionCode);
    saveTransactions(updated);
    set({ transactions: updated });
    return true;
  },

  addOfflineVote: (namaKlub: string, votesCount: number, voterEmail = "offline@forbasi.org") => {
    const amount = votesCount * 3000;
    const code = `OFFLINE-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";

    const item: VoteTransaction = {
      id: code,
      date: dateStr,
      namaKlub,
      voterEmail,
      votesCount,
      amount,
      status: "Lunas",
      createdAt: new Date().toISOString()
    };

    const updated = [item, ...get().transactions];
    saveTransactions(updated);
    set({ transactions: updated });
    return true;
  }
}));
