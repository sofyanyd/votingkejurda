import React, { useState, useEffect } from "react";
import { usePletonStore, type PletonData } from "../../../stores/pletonStore";
import { useCategoryStore } from "../../../stores/categoryStore";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  X,
  Image as ImageIcon
} from "lucide-react";

export default function PletonManagemen() {
  const { pletonList, loading, fetchPleton, addPleton, updatePleton, deletePleton } = usePletonStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Search State
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [namaPleton, setNamaPleton] = useState("");
  const [noUrut, setNoUrut] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({
    message: "",
    type: null,
  });

  // Inject font Plus Jakarta Sans
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
    if (type !== "loading") {
      setTimeout(() => setToast({ message: "", type: null }), 3000);
    }
  };

  // Handle Photo File Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file foto maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFoto(result);
        setFotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to parse bidang string "No. {noUrut} - {sekolah}"
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

  // Generate initial SVG Avatar
  const generateInitialAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const colors = ["#00a54f", "#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const color = colors[name.length % colors.length];
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="${encodeURIComponent(color)}"/><text x="50" y="55" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  };

  // Open Modal
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

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaPleton.trim() || !noUrut.trim() || !sekolah.trim()) {
      alert("Nama Pleton, Nomor Urut, dan Sekolah wajib diisi!");
      return;
    }

    const formatNoUrut = noUrut.padStart(2, "0");
    const bidangString = `No. ${formatNoUrut} - ${sekolah.trim()}`;

    const dataPayload = {
      nama: namaPleton.trim(),
      bidang: bidangString,
      email: email.trim(),
      foto_url: foto,
      category_id: categoryId ? Number(categoryId) : undefined
    };

    showToast("Menyimpan data...", "loading");

    let success = false;
    if (editingId !== null) {
      success = await updatePleton(editingId, dataPayload);
      if (success) {
        showToast("Pleton berhasil diperbarui!", "success");
      } else {
        showToast("Gagal memperbarui pleton.", "error");
      }
    } else {
      success = await addPleton(dataPayload);
      if (success) {
        showToast("Pleton berhasil ditambahkan!", "success");
      } else {
        showToast("Gagal menambahkan pleton.", "error");
      }
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pleton "${name}"?`)) {
      showToast("Menghapus pleton...", "loading");
      const success = await deletePleton(id);
      if (success) {
        showToast("Pleton berhasil dihapus!", "success");
      } else {
        showToast("Gagal menghapus pleton.", "error");
      }
    }
  };

  // Export to CSV
  const handleExportExcel = () => {
    showToast("Mengekspor data ke Excel...", "loading");

    setTimeout(() => {
      const headers = ["No", "ID Pleton", "Nomor Urut", "Nama Pleton", "Asal Sekolah / Instansi", "Email PJ"];
      const rows = filteredList.map((item, idx) => {
        const { noUrut: numUrut, sekolah: sch } = parseBidang(item.bidang);
        return [
          idx + 1,
          item.id,
          numUrut,
          item.nama,
          sch,
          item.email || "-",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((val) => {
              const cleanVal = String(val ?? "").replace(/"/g, '""');
              return cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"')
                ? `"${cleanVal}"`
                : cleanVal;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Data_Pleton_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("File Excel/CSV berhasil diunduh!", "success");
    }, 1000);
  };

  // Filtered List
  const filteredList = pletonList.filter((item) => {
    const { noUrut: num, sekolah: sch } = parseBidang(item.bidang);
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      sch.toLowerCase().includes(search.toLowerCase()) ||
      num.includes(search) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div
      className="w-full bg-[#f8fafc] rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-4 sm:p-6 md:p-8 space-y-6 text-slate-800 transition-all duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Toast Alert */}
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Manajemen Pleton</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Daftar pleton finalis kompetisi LKBB FORBASI Kota Tegal</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-emerald-200 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-50/20 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => openModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3 sm:py-2.5 sm:px-4 bg-[#00a54f] hover:bg-[#008f44] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus size={14} className="sm:w-4 sm:h-4" />
            Tambah Pleton
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/40 p-3 sm:p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pleton, nomor urut, sekolah, atau email..."
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
                <th className="p-3 sm:p-4 w-10 sm:w-12 text-center hidden md:table-cell">No</th>
                <th className="p-3 sm:p-4 w-12 sm:w-16">Foto</th>
                <th className="p-3 sm:p-4 w-16 sm:w-20 text-center">No Urut</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Nama Tim</th>
                <th className="p-3 sm:p-4">Kota / Daerah Asal</th>               
                <th className="p-3 sm:p-4 hidden md:table-cell">Kategori</th>
                <th className="p-3 sm:p-4 w-20 sm:w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs sm:text-sm">
                    Sedang memuat data dari database...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const { noUrut: num, sekolah: sch } = parseBidang(item.bidang);
                  const categoryObj = categories.find(c => c.id === item.category_id);
                  const categoryName = categoryObj ? categoryObj.nama : "-";
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 sm:p-4 text-center font-semibold text-slate-400 hidden md:table-cell">{idx + 1}</td>
                      <td className="p-3 sm:p-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                          <img 
                            src={item.foto_url || generateInitialAvatar(item.nama)} 
                            alt={item.nama} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = generateInitialAvatar(item.nama);
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="px-2 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-extrabold text-[10px] sm:text-xs">
                          {num}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 font-bold text-slate-800">
                        <div>{item.nama}</div>
                        <div className="sm:hidden text-[10px] font-semibold text-slate-400 mt-0.5">{sch}</div>
                      </td>
                      <td className="p-3 sm:p-4 font-semibold text-slate-500 hidden sm:table-cell">{sch}</td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] sm:text-xs font-semibold">
                          {categoryName}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => openModal(item)}
                            title="Edit"
                            className="p-1 sm:p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            title="Hapus"
                            className="p-1 sm:p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs sm:text-sm">
                    Tidak ditemukan data pleton yang cocok.
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
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="px-5 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-slate-800">
                {editingId ? "Edit Pleton" : "Tambah Pleton"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-250 flex items-center justify-center shrink-0 relative">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-350 w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-slate-500 mb-1">FOTO PLETON</span>
                    <label className="inline-block py-1.5 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:border-emerald-500 hover:text-[#00a54f] cursor-pointer transition-colors shadow-sm">
                      Pilih File Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[10px] text-slate-400 mt-1">Format JPG/PNG, maks. 2MB.</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200/60 pt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Atau Tempel URL Gambar
                  </label>
                  <input
                    type="url"
                    value={foto.startsWith("data:") ? "" : foto}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFoto(val);
                      setFotoPreview(val);
                    }}
                    placeholder="Contoh: https://i.imgur.com/abcdef.png"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Sekolah / Nama Tim */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Tim *
                </label>
                <input
                  type="text"
                  required
                  value={sekolah}
                  onChange={(e) => setSekolah(e.target.value)}
                  placeholder="Contoh: Demak A, Brebes B, Klaten"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* No Urut */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor Urut Tampil *
                </label>
                <input
                  type="text"
                  required
                  value={noUrut}
                  onChange={(e) => setNoUrut(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Contoh: 01, 02"
                  maxLength={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Kota / Daerah Asal */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kota / Daerah Asal *
                </label>
                <input
                  type="text"
                  required
                  value={namaPleton}
                  onChange={(e) => setNamaPleton(e.target.value)}
                  placeholder="Contoh: Kota Tegal, Demak, Semarang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kategori Pleton *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Penanggung Jawab (Opsional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pjpleton@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-2.5 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
