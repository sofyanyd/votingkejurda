import React, { useState, useEffect } from "react";
import { useCategoryStore, type CategoryData } from "../../../stores/categoryStore";
import { usePletonStore } from "../../../stores/pletonStore";
import { Plus, Search, Edit, Trash2, X, Tag } from "lucide-react";

export default function CategoryIndex() {
  const { categories, loading: categoriesLoading, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { pletonList, fetchPleton, loading: pletonLoading } = usePletonStore();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({ message: "", type: null });

  useEffect(() => {
    fetchCategories();
    fetchPleton();

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const showToast = (message: string, type: "success" | "loading" | "error") => {
    setToast({ message, type });
    if (type !== "loading") setTimeout(() => setToast({ message: "", type: null }), 3000);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori.trim()) return alert("Nama Kategori wajib diisi!");
    const payload = { nama: namaKategori.trim(), deskripsi: deskripsi.trim() || undefined };
    showToast("Menyimpan data...", "loading");

    const success = editingId !== null 
      ? await updateCategory(editingId, payload)
      : await addCategory(payload);

    if (success) {
      showToast(editingId ? "Kategori berhasil diperbarui!" : "Kategori berhasil ditambahkan!", "success");
      setIsModalOpen(false);
    } else {
      showToast("Gagal menyimpan kategori.", "error");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const pletonsInCat = pletonList.filter(p => {
      const text = `${p.nama} ${p.bidang}`.toLowerCase();
      const isSmp = text.includes("smp") || text.includes("mts");
      return (isSmp ? 1 : 2) === id;
    });

    if (pletonsInCat.length > 0) {
      return alert(`Tidak dapat menghapus kategori "${name}" karena masih memiliki ${pletonsInCat.length} pleton terkait.\nSilakan hapus atau pindahkan pleton terlebih dahulu.`);
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      showToast("Menghapus kategori...", "loading");
      const success = await deleteCategory(id);
      success ? showToast("Kategori berhasil dihapus!", "success") : showToast("Gagal menghapus kategori.", "error");
    }
  };

  const countPletons = (categoryId: number) => pletonList.filter(p => p.category_id === categoryId).length;

  const filteredList = categories.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase()))
  );

  const loading = categoriesLoading || pletonLoading;

  return (
    <div className="w-full space-y-6 text-slate-800 pb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {toast.type && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white shadow-xl p-4 rounded-xl animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "loading" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {toast.type === "success" && <div className="text-emerald-400 font-bold">✓</div>}
          {toast.type === "error" && <div className="text-rose-400 font-bold">✗</div>}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kategori Pleton</h2>
          <p className="text-sm text-slate-500 mt-1">Daftar kategori perlombaan LKBB FORBASI Kota Tegal.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center">
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kategori atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-16 text-center">ID</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Nama Kategori</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Deskripsi</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Jumlah Pleton</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-medium">Sedang memuat data kategori...</td></tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-center font-bold text-slate-400">{item.id}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Tag size={14} className="text-emerald-500 shrink-0" />
                        <span>{item.nama}</span>
                      </div>
                      <div className="sm:hidden text-xs text-slate-500 mt-1">{item.deskripsi || "-"}</div>
                    </td>
                    <td className="py-3 px-6 text-slate-500 hidden sm:table-cell">{item.deskripsi || "-"}</td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs">
                        {countPletons(item.id)} Pleton
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-400 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-medium">Tidak ditemukan data kategori yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? "Edit Kategori" : "Tambah Kategori"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Kategori <span className="text-rose-500">*</span></label>
                <input required type="text" value={namaKategori} onChange={(e) => setNamaKategori(e.target.value)} placeholder="Contoh: SMP Sederajat" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi (Opsional)</label>
                <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat mengenai kategori lomba ini..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">Batal</button>
                <button type="submit" className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}