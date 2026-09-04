import React, { useState, useEffect } from "react";
import { useUserStore, type UserAdmin } from "../../../stores/useUserStore";
import { Plus, Search, Edit, Trash2, X, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function UserManagemen() {
  const { userList, loading, fetchUsers, addUser, updateUser, deleteUser } = useUserStore();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "loading" | "error" | null }>({ message: "", type: null });

  useEffect(() => {
    fetchUsers();
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

  const openModal = (user?: UserAdmin) => {
    if (user) {
      setEditingId(user.id);
      setUsername(user.username);
      setEmail(user.email);
      setPassword("");
    } else {
      setEditingId(null);
      setUsername("");
      setEmail("");
      setPassword("");
    }
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return alert("Username dan Email wajib diisi!");
    if (!editingId && !password.trim()) return alert("Password wajib diisi untuk user baru!");
    if (password.trim() && password.length < 8) return alert("Password minimal 8 karakter!");

    const dataPayload = { username: username.trim(), email: email.trim().toLowerCase(), password: password.trim() || undefined };
    showToast("Menyimpan data...", "loading");

    const success = editingId ? await updateUser(editingId, dataPayload) : await addUser(dataPayload);
    if (success) {
      showToast(editingId ? "User admin berhasil diperbarui!" : "User admin berhasil ditambahkan!", "success");
      setIsModalOpen(false);
    } else {
      showToast("Gagal menyimpan user admin.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (userList.length <= 1) return alert("Tidak dapat menghapus satu-satunya user admin!");
    if (window.confirm(`Hapus admin "${name}"?`)) {
      showToast("Menghapus user...", "loading");
      const success = await deleteUser(id);
      success ? showToast("Dihapus!", "success") : showToast("Gagal menghapus.", "error");
    }
  };

  const toggleTablePassword = (id: string) => setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredList = userList.filter((item) => item.username.toLowerCase().includes(search.toLowerCase()) || item.email.toLowerCase().includes(search.toLowerCase()));

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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen User Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Daftar pengguna dengan akses administratif.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center">
          <Plus size={16} /> Tambah Admin
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari admin berdasarkan username atau email..."
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
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-16 text-center">No</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Username</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Password</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const isVisible = showPasswordMap[item.id] || false;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><ShieldCheck size={16} /></div>
                          <span className="font-bold text-slate-800">{item.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-500">{item.email}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{isVisible ? item.password : "••••••••"}</span>
                          <button onClick={() => toggleTablePassword(item.id)} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">{isVisible ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openModal(item)} className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-400 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.username)} className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-medium">Tidak ditemukan data user admin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? "Edit User Admin" : "Tambah User Admin"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Username <span className="text-rose-500">*</span></label>
                <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Contoh: admin_tegal" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password {editingId ? "(Kosongkan jika tidak diubah)" : "<span class='text-rose-500'>*</span>"}</label>
                <div className="relative">
                  <input type={showFormPassword ? "text" : "password"} required={!editingId} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingId ? "Biarkan kosong untuk mempertahankan" : "Minimal 8 karakter"} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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