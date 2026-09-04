import React, { useState, useEffect } from "react";
import { useQrCodeStore, type QrCode } from "../../../stores/useQrCodeStore";
import { usePletonStore } from "../../../stores/pletonStore";
import { useTransactionStore, type VoteTransaction } from "../../../stores/transactionStore";
import { 
  Coins, 
  Download, 
  Search, 
  Vote,
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  FileText,
  Calendar,
  Filter
} from "lucide-react";

export default function FinanceIndex() {
  const { qrList, addQrCode, updateQrCode, deleteQrCode, fetchQrCodes } = useQrCodeStore();
  const { pletonList, fetchPleton } = usePletonStore();
  const { 
    transactions, 
    fetchTransactions, 
    approveTransaction, 
    deleteTransaction, 
    addOfflineVote 
  } = useTransactionStore();

  const [loading, setLoading] = useState(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"Dashboard" | "Detail Laporan" | "Histori Transaksi" | "Kelola QR Code" | "Tambah Vote Offline">("Dashboard");
  
  // Filters State
  const [selectedMonth, setSelectedMonth] = useState("Semua");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({
    message: "",
    type: null,
  });

  // QR Code Modal CRUD Form State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [editingQrId, setEditingQrId] = useState<string | null>(null);
  const [qrName, setQrName] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [qrImagePreview, setQrImagePreview] = useState("");
  const [qrDescription, setQrDescription] = useState("");
  const [qrStatus, setQrStatus] = useState<"Aktif" | "Non-Aktif">("Aktif");

  // Detail Modal State
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Offline Votes Form State
  const [selectedPletonId, setSelectedPletonId] = useState("");
  const [offlineVotesQty, setOfflineVotesQty] = useState(1);
  const [offlineVoterEmail, setOfflineVoterEmail] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchTransactions();
    fetchPleton();
    fetchQrCodes();
  }, []);

  const handleApproveManual = async (transactionCode: string) => {
    if (!window.confirm("Apakah Anda yakin ingin memverifikasi transaksi pembayaran manual ini secara manual?")) {
      return;
    }
    
    showToast("Memproses verifikasi...", "loading");
    const success = await approveTransaction(transactionCode);
    if (success) {
      showToast("Pembayaran berhasil diverifikasi secara manual!", "success");
    } else {
      showToast("Gagal memverifikasi pembayaran.", "error");
    }
  };

  const handleDeleteTransaction = async (transactionCode: string, status: string) => {
    const confirmMessage = status === "Lunas"
      ? `⚠️ PERINGATAN: Transaksi LUNAS. Menghapus akan mengurangi suara (vote) pleton terkait.\nYakin ingin menghapus?`
      : `Apakah Anda yakin ingin menghapus transaksi pending ini?`;

    if (!window.confirm(confirmMessage)) return;

    showToast("Menghapus transaksi...", "loading");
    const success = await deleteTransaction(transactionCode);
    if (success) {
      showToast("Transaksi dan suara terkait berhasil dihapus!", "success");
    } else {
      showToast("Gagal menghapus transaksi.", "error");
    }
  };

  const handleSubmitOfflineVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPletonId) return showToast("Pilih Pleton terlebih dahulu", "error");
    if (offlineVotesQty <= 0) return showToast("Jumlah vote tidak valid", "error");

    const targetPleton = pletonList.find(p => String(p.id) === String(selectedPletonId));
    const namaKlub = targetPleton ? targetPleton.nama : "Pleton";
    const finalistId = Number(selectedPletonId);

    if (!window.confirm(`Tambahkan ${offlineVotesQty} vote offline untuk ${namaKlub}?`)) return;

    showToast("Memasukkan vote offline...", "loading");
    const success = await addOfflineVote(finalistId, namaKlub, offlineVotesQty, offlineVoterEmail.trim() || undefined);
    if (success) {
      showToast("Vote offline berhasil dimasukkan!", "success");
      setSelectedPletonId("");
      setOfflineVotesQty(1);
      setOfflineVoterEmail("");
    } else {
      showToast("Gagal memasukkan vote offline.", "error");
    }
  };

  const parseBidang = (bidang: string) => {
    let noUrutParsed = "01";
    let sekolahParsed = bidang;
    if (bidang.startsWith("No. ") && bidang.includes(" - ")) {
      const parts = bidang.substring(4).split(" - ");
      noUrutParsed = parts[0].trim();
      sekolahParsed = parts.slice(1).join(" - ").trim();
    }
    return { noUrut: noUrutParsed, sekolah: sekolahParsed };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace("Rp", "Rp ");
  };

  const showToast = (message: string, type: "success" | "loading" | "error") => {
    setToast({ message, type });
    if (type !== "loading") {
      setTimeout(() => setToast({ message: "", type: null }), 3000);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.namaKlub.toLowerCase().includes(search.toLowerCase()) ||
      tx.voterEmail.toLowerCase().includes(search.toLowerCase());

    const matchesMonth =
      selectedMonth === "Semua" ||
      (selectedMonth === "Juli" && tx.date.includes("Juli")) ||
      (selectedMonth === "Juni" && tx.date.includes("Juni")) ||
      (selectedMonth === "Mei" && tx.date.includes("Mei"));

    const matchesStatus = selectedStatus === "Semua" || tx.status === selectedStatus;
    const matchesStart = !filterStart || (tx.createdAt && new Date(tx.createdAt) >= new Date(filterStart));
    const matchesEnd = !filterEnd || (tx.createdAt && new Date(tx.createdAt) <= new Date(filterEnd));

    return matchesSearch && matchesMonth && matchesStatus && matchesStart && matchesEnd;
  });

  const getPaymentCode = (id: string) => (id.startsWith("TX-") ? id.split("-").slice(2).join("-") : id);

  const groupedTransactionsList = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    filteredTransactions.forEach((tx) => {
      const pCode = getPaymentCode(tx.id);
      if (!groups[pCode]) {
        groups[pCode] = {
          paymentCode: pCode,
          date: tx.date,
          voterEmail: tx.voterEmail,
          status: tx.status,
          totalVotes: 0,
          totalAmount: 0,
          grandTotal: tx.grandTotal || 0,
          items: []
        };
      }
      groups[pCode].totalVotes += tx.votesCount;
      groups[pCode].totalAmount += tx.amount;
      if ((tx.grandTotal || tx.amount) > groups[pCode].grandTotal) {
        groups[pCode].grandTotal = tx.grandTotal || tx.amount;
      }
      if (tx.status === "Lunas") groups[pCode].status = "Lunas";
      else if (tx.status === "Batal" && groups[pCode].status === "Pending") groups[pCode].status = "Batal";

      groups[pCode].items.push({ id: tx.id, namaKlub: tx.namaKlub, votesCount: tx.votesCount, amount: tx.amount });
    });
    return Object.values(groups);
  }, [filteredTransactions]);

  const handleOpenDetails = (group: any) => {
    setSelectedGroup(group);
    setIsDetailModalOpen(true);
  };

  const filteredQrList = qrList.filter((qr) =>
    qr.name.toLowerCase().includes(search.toLowerCase()) || qr.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalKeuangan = filteredTransactions.filter((tx) => tx.status === "Lunas").reduce((sum, tx) => sum + tx.amount, 0);
  const totalVotes = filteredTransactions.filter((tx) => tx.status === "Lunas").reduce((sum, tx) => sum + tx.votesCount, 0);

  const memberReport = pletonList.map((pleton) => {
    const clubVotes = filteredTransactions
      .filter((tx) => tx.status === "Lunas" && tx.namaKlub.toLowerCase() === pleton.nama.toLowerCase())
      .reduce((sum, tx) => sum + tx.votesCount, 0);
    const { sekolah } = parseBidang(pleton.bidang);
    return { name: pleton.nama, school: sekolah, votes: clubVotes, amount: clubVotes * 3000, status: "Aktif" };
  });

  const sortedReport = [...memberReport].sort((a, b) => b.votes - a.votes);

  const handleExportExcel = () => {
    showToast("Mengekspor data ke Excel...", "loading");
    setTimeout(() => {
      let csvContent = "";
      let filename = "";

      if (activeTab === "Detail Laporan") {
        filename = `Laporan_Voting_${new Date().toISOString().slice(0,10)}.csv`;
        const headers = ["Rank", "Nama Klub", "Afiliasi Sekolah", "Jumlah Voting", "Total Transaksi", "Status"];
        csvContent = [headers.join(","), ...sortedReport.map((item, idx) => `"${idx + 1}","${item.name}","${item.school}","${item.votes}","${formatCurrency(item.amount)}","${item.status}"`)].join("\n");
      } else if (activeTab === "Kelola QR Code") {
        filename = `Daftar_QR_${new Date().toISOString().slice(0,10)}.csv`;
        const headers = ["ID", "Nama QR", "Deskripsi", "Status"];
        csvContent = [headers.join(","), ...qrList.map(qr => `"${qr.id}","${qr.name}","${qr.description}","${qr.status}"`)].join("\n");
      } else {
        filename = `Riwayat_Transaksi_${new Date().toISOString().slice(0,10)}.csv`;
        const headers = ["ID Transaksi", "Tanggal", "Nama Klub", "Voter Email", "Jumlah Voting", "Total Transaksi", "Status"];
        csvContent = [headers.join(","), ...filteredTransactions.map(tx => `"${tx.id}","${tx.date}","${tx.namaKlub}","${tx.voterEmail}","${tx.votesCount}","${formatCurrency(tx.amount)}","${tx.status}"`)].join("\n");
      }

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("File berhasil diunduh!", "success");
    }, 800);
  };

  const handleQrPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Maksimal 2MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImage(reader.result as string);
        setQrImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openQrModal = (qr?: QrCode) => {
    if (qr) {
      setEditingQrId(String(qr.id));
      setQrName(qr.name);
      setQrImage(qr.image);
      setQrImagePreview(qr.image);
      setQrDescription(qr.description);
      setQrStatus(qr.status as "Aktif" | "Non-Aktif");
    } else {
      setEditingQrId(null);
      setQrName("");
      setQrImage("");
      setQrImagePreview("");
      setQrDescription("");
      setQrStatus("Aktif");
    }
    setIsQrModalOpen(true);
  };

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrName.trim() || !qrDescription.trim()) return alert("Nama dan Deskripsi wajib diisi!");
    
    const mockQrSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f8fafc"/></svg>`;
    const payload = { name: qrName.trim(), image: qrImage || mockQrSvg, description: qrDescription.trim(), status: qrStatus };

    showToast("Menyimpan...", "loading");
    try {
      if (editingQrId) await updateQrCode(editingQrId, payload);
      else await addQrCode(payload);
      showToast("QR Code berhasil disimpan!", "success");
      setIsQrModalOpen(false);
    } catch {
      showToast("Gagal menyimpan.", "error");
    }
  };

  const handleQrDelete = async (id: string | number, name: string) => {
    if (window.confirm(`Hapus QR Code "${name}"?`)) {
      showToast("Menghapus...", "loading");
      try {
        await deleteQrCode(id);
        showToast("Dihapus!", "success");
      } catch {
        showToast("Gagal menghapus.", "error");
      }
    }
  };

  return (
    <div className="w-full space-y-6 font-sans text-slate-800 pb-12">
      
      {/* Toast Notification */}
      {toast.type && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white shadow-xl p-4 rounded-xl animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "loading" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {toast.type === "success" && <div className="text-emerald-400 font-bold">✓</div>}
          {toast.type === "error" && <div className="text-rose-400 font-bold">✗</div>}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Keuangan & Voting</h2>
          <p className="text-sm text-slate-500 mt-1">Pantau arus kas, verifikasi transaksi, dan kelola pembayaran.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {activeTab === "Kelola QR Code" && (
            <button onClick={() => openQrModal()} className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all">
              <Plus size={16} /> Tambah QR
            </button>
          )}
          <button onClick={handleExportExcel} className="flex flex-1 md:flex-none items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Coins size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Keuangan</div>
            <div className="text-xl font-black text-slate-800">{formatCurrency(totalKeuangan)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Vote size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Voting Masuk</div>
            <div className="text-xl font-black text-slate-800">{totalVotes.toLocaleString("id-ID")}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transaksi Lunas</div>
            <div className="text-xl font-black text-slate-800">{filteredTransactions.filter((tx) => tx.status === "Lunas").length}</div>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-slate-200 flex overflow-x-auto custom-scrollbar">
        {[
          { key: "Dashboard", label: "Ringkasan" },
          { key: "Detail Laporan", label: "Detail Pleton" },
          { key: "Histori Transaksi", label: "Histori Transaksi" },
          { key: "Kelola QR Code", label: "Kelola QR Code" },
          { key: "Tambah Vote Offline", label: "Vote Offline" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`whitespace-nowrap py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Filter Bar (Contextual) */}
      {activeTab !== "Kelola QR Code" && activeTab !== "Tambah Vote Offline" && activeTab !== "Dashboard" && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi, klub, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="Semua">Semua Bulan</option>
              <option value="Juli">Juli 2026</option>
              <option value="Juni">Juni 2026</option>
              <option value="Mei">Mei 2026</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Lunas">Lunas</option>
              <option value="Batal">Batal</option>
            </select>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT ── */}

      {/* Dashboard Tab */}
      {activeTab === "Dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Top 3 Peringkat Tertinggi</h3>
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
              </span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {sortedReport.slice(0, 3).map((club, idx) => (
                <div key={club.name} className="flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-emerald-100 rounded-xl shadow-sm transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-lg ${
                      idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-600"
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{club.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{club.school}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-600">{club.votes.toLocaleString()} Suara</div>
                    <div className="text-[11px] font-bold text-slate-400 mt-0.5">{formatCurrency(club.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Informasi Sistem</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 mb-1">Tarif Voting</h4>
                <p className="text-sm text-indigo-600/80 font-medium">Rp 3.000,- per 1 vote dukungan.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Verifikasi</h4>
                <p className="text-sm text-slate-500 font-medium">Transaksi Lunas akan otomatis menambah suara ke leaderboard instan.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Laporan Tab */}
      {activeTab === "Detail Laporan" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-16 text-center">Rank</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Kandidat</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Total Voting</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReport.map((club, idx) => (
                  <tr key={club.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-6">
                      <div className="font-bold text-slate-800">{club.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{club.school}</div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs">
                        {club.votes.toLocaleString()} Suara
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-black text-slate-800">
                      {formatCurrency(club.amount)}
                    </td>
                  </tr>
                ))}
                {sortedReport.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">Belum ada data pleton.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Histori Transaksi Tab */}
      {activeTab === "Histori Transaksi" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">ID & Waktu</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Detail Pembelian</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-right">Nominal</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupedTransactionsList.map((tx) => (
                  <tr key={tx.paymentCode} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{tx.paymentCode}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tx.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => handleOpenDetails(tx)}>
                        {tx.items.length === 1 ? tx.items[0].namaKlub : `${tx.items[0].namaKlub} (+${tx.items.length - 1} Item)`}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{tx.voterEmail} &bull; <span className="font-bold text-slate-600">{tx.totalVotes} Vote</span></div>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-slate-800">
                      {formatCurrency(tx.grandTotal || tx.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                        tx.status === "Lunas" ? "bg-emerald-100 text-emerald-700" :
                        tx.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        {tx.status === "Pending" && (
                          <button onClick={() => handleApproveManual(tx.paymentCode)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                            ACC
                          </button>
                        )}
                        <button onClick={() => handleDeleteTransaction(tx.paymentCode, tx.status)} className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {groupedTransactionsList.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium">Tidak ada transaksi ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kelola QR Code Tab */}
      {activeTab === "Kelola QR Code" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQrList.map((qr) => (
              <div key={qr.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-slate-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 p-1 flex shrink-0 shadow-sm">
                    <img src={qr.image} alt={qr.name} className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${qr.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {qr.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{qr.name}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{qr.description}</p>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => openQrModal(qr)} className="flex-1 py-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleQrDelete(qr.id, qr.name)} className="flex-1 py-2 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
            {filteredQrList.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">Belum ada QR Code.</div>
            )}
          </div>
        </div>
      )}

      {/* Tambah Vote Offline Tab */}
      {activeTab === "Tambah Vote Offline" && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">Input Vote Tunai/Offline</h3>
            <p className="text-sm text-slate-500 mt-1">Masukkan data pembayaran tunai agar otomatis terakumulasi ke dalam sistem leaderboard.</p>
          </div>
          <form onSubmit={handleSubmitOfflineVotes} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Pleton Kandidat <span className="text-rose-500">*</span></label>
              <select required value={selectedPletonId} onChange={(e) => setSelectedPletonId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
                <option value="">-- Pilih Pleton --</option>
                {pletonList.map((p) => <option key={p.id} value={p.id}>{p.nama} ({parseBidang(p.bidang).sekolah})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Vote <span className="text-rose-500">*</span></label>
              <input type="number" required min={1} value={offlineVotesQty} onChange={(e) => setOfflineVotesQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              <div className="mt-1.5 text-xs text-slate-500">Nilai Konversi: <span className="font-bold text-emerald-600">{formatCurrency(offlineVotesQty * 3000)}</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Pembeli (Opsional)</label>
              <input type="email" placeholder="contoh@email.com" value={offlineVoterEmail} onChange={(e) => setOfflineVoterEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button type="submit" className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2">
                <Plus size={16} /> Simpan Transaksi Offline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals (QR Code & Detail) */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{editingQrId ? "Edit QR Code" : "Tambah QR Code"}</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleQrSubmit} className="p-6 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {qrImagePreview ? <img src={qrImagePreview} alt="Preview" className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-300 w-6 h-6" />}
                </div>
                <div>
                  <label className="inline-block py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    Pilih Gambar QR
                    <input type="file" accept="image/*" onChange={handleQrPhotoChange} className="hidden" />
                  </label>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Format JPG/PNG maks 2MB</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Label / Bank</label>
                <input type="text" required value={qrName} onChange={(e) => setQrName(e.target.value)} placeholder="Misal: BCA atau QRIS DANA" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Detail Rekening</label>
                <textarea required rows={3} value={qrDescription} onChange={(e) => setQrDescription(e.target.value)} placeholder="No. Rekening A/N Nama" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select value={qrStatus} onChange={(e) => setQrStatus(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsQrModalOpen(false)} className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">Batal</button>
                <button type="submit" className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">Detail Pembelian</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedGroup.paymentCode}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal</span>
                  <span className="text-sm font-bold text-slate-700">{selectedGroup.date}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedGroup.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{selectedGroup.status}</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-2">Item Vote</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedGroup.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 text-sm bg-white">
                      <div>
                        <div className="font-bold text-slate-800">{item.namaKlub}</div>
                        <div className="text-xs text-slate-500">{item.votesCount} Suara</div>
                      </div>
                      <div className="font-black text-slate-700">{formatCurrency(item.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-500">Total Pembayaran</span>
                <span className="text-xl font-black text-emerald-600">{formatCurrency(selectedGroup.grandTotal || selectedGroup.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}