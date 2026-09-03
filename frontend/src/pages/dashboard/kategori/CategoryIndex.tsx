import React, { useState, useEffect } from "react";
import { useCategoryStore, type CategoryData } from "../../../stores/categoryStore";
import { usePletonStore } from "../../../stores/pletonStore";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Tag
} from "lucide-react";

export default function CategoryIndex() {
  const { categories, loading: categoriesLoading, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { pletonList, fetchPleton, loading: pletonLoading } = usePletonStore();

  // Search & Filter State
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [namaKategori, setNamaKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchPleton();

    // Inject font Plus Jakarta Sans
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const showToast = (message: string, type: "success" | "loading" | "error") => {
    setToast({ message, type });
    if (type !== "loading") {
      setTimeout(() => setToast({ message: "", type: null }), 3000);
    }
  };

  // Open Modal for Add/Edit
  const openModal = (category?: CategoryData) => {
    if (category) {
      setEditingId(category.id);
      setNamaKategori(category.nama);
      setDeskripsi(category.deskripsi || "");
    } else {
      setEditingId(null);
      setNamaKategori("");
      setDeskripsi("");
    }
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaKategori.trim()) {
      alert("Nama Kategori wajib diisi!");
      return;
    }

    const payload = {
      nama: namaKategori.trim(),
      deskripsi: deskripsi.trim() || undefined,
    };

    showToast("Menyimpan data...", "loading");

    let success = false;
    if (editingId !== null) {
      success = await updateCategory(editingId, payload);
      if (success) {
        showToast("Kategori berhasil diperbarui!", "success");
      } else {
        showToast("Gagal memperbarui kategori.", "error");
      }
    } else {
      success = await addCategory(payload);
      if (success) {
        showToast("Kategori berhasil ditambahkan!", "success");
      } else {
        showToast("Gagal menambahkan kategori.", "error");
      }
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number, name: string) => {
    const pletonsInCat = pletonList.filter(p => {
      // Determine category based on school/instansi name like speakerController does
      const text = `${p.nama} ${p.bidang}`.toLowerCase();
      const isSmp = text.includes("smp") || text.includes("mts");
      const catId = isSmp ? 1 : 2;
      return catId === id;
    });

    if (pletonsInCat.length > 0) {
      alert(
        `Tidak dapat menghapus kategori "${name}" karena masih memiliki ${pletonsInCat.length} pleton terkait.\n` +
        `Silakan hapus atau pindahkan pleton terlebih dahulu.`
      );
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      showToast("Menghapus kategori...", "loading");
      const success = await deleteCategory(id);
      if (success) {
        showToast("Kategori berhasil dihapus!", "success");
      } else {
        showToast("Gagal menghapus kategori.", "error");
      }
    }
  };

  // Helper to count pletons in a category
  const countPletons = (categoryId: number) => {
    return pletonList.filter(p => p.category_id === categoryId).length;
  };

  // Filtered List
  const filteredList = categories.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const loading = categoriesLoading || pletonLoading;

  return (
    <div
      className="w-full bg-[#f8fafc] rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-4 sm:p-6 md:p-8 space-y-6 text-slate-800 transition-all duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Toast Notification */}
      {toast.type && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-slate-100 shadow-2xl p-4 rounded-2xl animate-bounce">
          {toast.type === "loading" ? (
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          ) : toast.type === "success" ? (
            <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">✓</div>
          ) : (
            <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">✗</div>
          )}
          <span className="text-sm font-semibold text-slate-700">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Kategori Pleton</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Daftar kategori perlombaan LKBB FORBASI Kota Tegal</p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-[#00a54f] hover:bg-[#008f44] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          <Plus size={14} className="sm:w-4 sm:h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/40 p-3 sm:p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kategori atau deskripsi..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
          <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <th className="p-3 sm:p-4 w-12 text-center">ID</th>
                <th className="p-3 sm:p-4">Nama Kategori</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Deskripsi</th>
                <th className="p-3 sm:p-4 w-32 text-center">Jumlah Pleton</th>
                <th className="p-3 sm:p-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs sm:text-sm">
                    Sedang memuat data kategori dari database...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 text-center font-semibold text-slate-450">{item.id}</td>
                    <td className="p-3 sm:p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-emerald-500 shrink-0" />
                        <span>{item.nama}</span>
                      </div>
                      <div className="sm:hidden text-[10px] font-semibold text-slate-400 mt-1">{item.deskripsi || "-"}</div>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500 hidden sm:table-cell">{item.deskripsi || "-"}</td>
                    <td className="p-3 sm:p-4 text-center">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-bold text-xs">
                        {countPletons(item.id)} Pleton
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openModal(item)}
                          title="Edit"
                          className="p-1 sm:p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-450 transition-colors cursor-pointer"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          title="Hapus"
                          className="p-1 sm:p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-450 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs sm:text-sm">
                    Tidak ditemukan data kategori yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-slate-800">
                {editingId ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Nama Kategori */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: SMP Sederajat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat mengenai kategori lomba ini..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 sm:py-2.5 sm:px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 sm:py-2.5 sm:px-6 bg-[#00a54f] hover:bg-[#008f44] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}