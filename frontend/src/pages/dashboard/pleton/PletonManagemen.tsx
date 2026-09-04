import React, { useState, useEffect } from "react";
import { usePletonStore, type PletonData } from "../../../stores/pletonStore";
import { useCategoryStore } from "../../../stores/categoryStore";
import { Plus, Search, Edit, Trash2, Download, X, Image as ImageIcon } from "lucide-react";

export default function PletonManagemen() {
  const { pletonList, loading, fetchPleton, addPleton, updatePleton, deletePleton } = usePletonStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [namaPleton, setNamaPleton] = useState("");
  const [noUrut, setNoUrut] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({ message: "", type: null });

  useEffect(() => {
    fetchPleton();
    fetchCategories();
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
    if (type !== "loading") setTimeout(() => setToast({ message: "", type: null }), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Ukuran file foto maksimal 2MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseBidang = (bidang: string) => {
    let noUrutParsed = "01", sekolahParsed = bidang;
    if (bidang.startsWith("No. ") && bidang.includes(" - ")) {
      const parts = bidang.substring(4).split(" - ");
      noUrutParsed = parts[0].trim();
      sekolahParsed = parts.slice(1).join(" - ").trim();
    }
    return { noUrut: noUrutParsed, sekolah: sekolahParsed };
  };

  const generateInitialAvatar = (name: string) => {
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["#00a54f", "#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const color = colors[name.length % colors.length];
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${encodeURIComponent(color)}"/><text x="50" y="55" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  };

  const openModal = (pleton?: PletonData) => {
    if (pleton) {
      const { noUrut: parsedNo, sekolah: parsedSekolah } = parseBidang(pleton.bidang);
      setEditingId(pleton.id);
      setNamaPleton(pleton.nama);
      setNoUrut(parsedNo);
      setSekolah(parsedSekolah);
      setEmail(pleton.email || "");
      setFoto(pleton.foto_url || "");
      setFotoPreview(pleton.foto_url || "");
      setCategoryId(pleton.category_id || "");
    } else {
      setEditingId(null);
      setNamaPleton("");
      setNoUrut("");
      setSekolah("");
      setEmail("");
      setFoto("");
      setFotoPreview("");
      setCategoryId("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPleton.trim() || !noUrut.trim() || !sekolah.trim()) return alert("Nama Pleton, Nomor Urut, dan Sekolah wajib diisi!");
    
    const formatNoUrut = noUrut.padStart(2, "0");
    const dataPayload = {
      nama: namaPleton.trim(),
      bidang: `No. ${formatNoUrut} - ${sekolah.trim()}`,
      email: email.trim(),
      foto_url: foto,
      category_id: categoryId ? Number(categoryId) : undefined
    };

    showToast("Menyimpan data...", "loading");
    const success = editingId !== null ? await updatePleton(editingId, dataPayload) : await addPleton(dataPayload);
    
    if (success) {
      showToast(editingId ? "Pleton berhasil diperbarui!" : "Pleton berhasil ditambahkan!", "success");
      setIsModalOpen(false);
    } else {
      showToast("Gagal menyimpan pleton.", "error");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Hapus pleton "${name}"?`)) {
      showToast("Menghapus...", "loading");
      const success = await deletePleton(id);
      success ? showToast("Dihapus!", "success") : showToast("Gagal menghapus.", "error");
    }
  };

  const handleExportExcel = () => {
    showToast("Mengekspor data...", "loading");
    setTimeout(() => {
      const headers = ["No", "ID Pleton", "Nomor Urut", "Nama Pleton", "Asal Sekolah / Instansi", "Email PJ"];
      const rows = filteredList.map((item, idx) => {
        const { noUrut: numUrut, sekolah: sch } = parseBidang(item.bidang);
        return [idx + 1, item.id, numUrut, item.nama, sch, item.email || "-"];
      });

      const csvContent = [headers.join(","), ...rows.map(row => row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Data_Pleton_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("File berhasil diunduh!", "success");
    }, 1000);
  };

  const filteredList = pletonList.filter((item) => {
    const { noUrut: num, sekolah: sch } = parseBidang(item.bidang);
    return item.nama.toLowerCase().includes(search.toLowerCase()) || sch.toLowerCase().includes(search.toLowerCase()) || num.includes(search) || (item.email && item.email.toLowerCase().includes(search.toLowerCase()));
  });

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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pleton</h2>
          <p className="text-sm text-slate-500 mt-1">Daftar pleton finalis kompetisi LKBB FORBASI Kota Tegal.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => openModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus size={16} /> Tambah Pleton
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pleton, nomor urut, sekolah, atau email..."
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
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-12 text-center hidden md:table-cell">No</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-16">Foto</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">No Urut</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Nama Tim</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Kota / Daerah Asal</th>               
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500 font-medium">Sedang memuat data dari database...</td></tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const { noUrut: num, sekolah: sch } = parseBidang(item.bidang);
                  const categoryName = categories.find(c => c.id === item.category_id)?.nama || "-";
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 text-center font-bold text-slate-400 hidden md:table-cell">{idx + 1}</td>
                      <td className="py-3 px-6">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <img src={item.foto_url || generateInitialAvatar(item.nama)} alt={item.nama} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = generateInitialAvatar(item.nama)} />
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-extrabold text-xs border border-emerald-100">{num}</span>
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-800">
                        <div>{item.nama}</div>
                        <div className="sm:hidden text-xs text-slate-500 mt-0.5">{sch}</div>
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-500 hidden sm:table-cell">{sch}</td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold">{categoryName}</span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openModal(item)} className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-400 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.nama)} className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500 font-medium">Tidak ditemukan data pleton yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? "Edit Pleton" : "Tambah Pleton"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {fotoPreview ? <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300 w-6 h-6" />}
                  </div>
                  <div>
                    <label className="inline-block py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      Pilih Gambar Pleton
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                    <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Format JPG/PNG maks 2MB</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <input type="url" value={foto.startsWith("data:") ? "" : foto} onChange={(e) => { setFoto(e.target.value); setFotoPreview(e.target.value); }} placeholder="Atau Tempel URL Gambar: https://..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Tim <span className="text-rose-500">*</span></label>
                <input required type="text" value={sekolah} onChange={(e) => setSekolah(e.target.value)} placeholder="Contoh: Demak A, Brebes B, Klaten" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Urut Tampil <span className="text-rose-500">*</span></label>
                <input required type="text" value={noUrut} onChange={(e) => setNoUrut(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Contoh: 01, 02" maxLength={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kota / Daerah Asal <span className="text-rose-500">*</span></label>
                <input required type="text" value={namaPleton} onChange={(e) => setNamaPleton(e.target.value)} placeholder="Contoh: Kota Tegal, Demak, Semarang" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Pleton <span className="text-rose-500">*</span></label>
                <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Penanggung Jawab (Opsional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pjpleton@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
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