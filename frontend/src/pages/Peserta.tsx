import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Button from "../components/ui/Button"; 
import { Collapse } from "../components/ui/Collapse";
import { Calendar, MapPin, CheckCircle, Users, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Peserta() {
  const navigate = useNavigate();

  const [finalists, setFinalists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | "Semua">("Semua");

  const categoryOptions = [
    { id: "Semua", label: "Semua Kategori" },
    { id: 2, label: "U13" },
    { id: 1, label: "U16" },
    { id: 3, label: "U19" },
    { id: 4, label: "Purna" },
  ];

  useEffect(() => {
    const fetchFinalists = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/speakers`);
        const rawData = Array.isArray(response.data) ? response.data : [];
        const mapped = rawData.map((item: any) => {
          let no_urut = "01";
          let role = item.bidang;
          if (item.bidang.startsWith("No. ") && item.bidang.includes(" - ")) {
            const parts = item.bidang.substring(4).split(" - ");
            no_urut = parts[0].trim();
            role = parts[1].trim();
          }
          return {
            id: item.id,
            name: item.nama,
            role: role,
            no_urut: no_urut,
            category_id: item.category_id,
            imageUrl: item.foto_url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(item.nama)}`
          };
        });
        setFinalists(mapped);
      } catch (error) {
        console.error("Gagal mengambil data finalis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinalists();
  }, []);

  const filteredFinalists = selectedCategory === "Semua"
    ? finalists
    : finalists.filter(f => f.category_id === Number(selectedCategory));

  const faqItems = [
    {
      title: "Bagaimana kriteria penentuan Juara Favorit?",
      description: "Juara Favorit murni ditentukan dari akumulasi jumlah otorisasi suara (voting) yang masuk melalui platform resmi ini. Tidak ada intervensi dari nilai dewan juri lapangan KEJURDA.",
    },
    {
      title: "Apakah profil detail delegasi akan diperbarui?",
      description: "Ya. Saat ini informasi difokuskan pada nama delegasi, asal instansi, dan nomor urut tampil. Foto resmi dan data tambahan akan diunggah oleh panitia daerah setelah validasi final.",
    },
    {
      title: "Bagaimana cara menyumbangkan suara?",
      description: "Navigasikan ke menu 'Dukungan', dapatkan Tiket Vote resmi, lalu masuk ke Katalog Voting untuk mengeksekusi dukungan Anda kepada delegasi pilihan.",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] font-sans min-h-screen pb-24 selection:bg-emerald-500 selection:text-white">

      {/* ── 1. HERO SECTION ── */}
      <section className="relative w-full pt-36 pb-28 md:pt-44 md:pb-32 overflow-hidden flex flex-col items-center text-center px-6 border-b border-slate-100 bg-white">
        
        {/* Soft Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-60">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/50 blur-[100px] mix-blend-multiply"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/80 blur-[80px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles size={14} /> ROSTER OFFICIAL
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-[1.15] mb-4">
            Galeri <span className="text-emerald-600">Kandidat Daerah</span>
          </h1>
          
          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium mb-8 max-w-2xl">
            Jelajahi formasi resmi peserta KEJURDA 2026. Analisis profil dan rekam jejak delegasi sebelum Anda menjatuhkan otorisasi suara berharga Anda.
          </p>
          
          <Button 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 flex items-center justify-center gap-2 transition-all rounded-xl shadow-[0_8px_20px_rgb(16,185,129,0.2)] hover:-translate-y-1 cursor-pointer" 
              onClick={() => navigate("/dukungan")}
          >
              OTORISASI SUARA <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ── 2. FLOATING INFO BAR (Dinaikkan lebih tinggi menggunakan -mt-8 md:-mt-10) ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-12 md:-mt-16 mb-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-white p-2.5 flex flex-col md:flex-row gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[
            { icon: Calendar, title: "TANGGAL", val: "12 Juli 2026" },
            { icon: MapPin, title: "LOKASI", val: "Universitas BSI Tegal" },
            { icon: CheckCircle, title: "PENUTUPAN", val: "16.00 WIB" },
          ].map((item, i) => (
            <div key={i} className="flex-1 flex items-center justify-start md:justify-center px-6 py-4 hover:bg-slate-50/50 transition-colors first:rounded-t-[1.5rem] md:first:rounded-l-[1.5rem] md:first:rounded-tr-none last:rounded-b-[1.5rem] md:last:rounded-r-[1.5rem] md:last:rounded-bl-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500 shrink-0 border border-slate-100">
                <item.icon size={20} />
              </div>
              <div className="text-left ml-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.title}</p>
                <h4 className="font-black text-slate-700 text-sm md:text-base">{item.val}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. GRID PESERTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daftar Delegasi</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Filter delegasi berdasarkan kategori perlombaan</p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <Users size={16} className="text-emerald-500" />
            <span className="text-slate-700 text-sm font-bold">{filteredFinalists.length} Tim Terdaftar</span>
          </div>
        </div>

        {/* ── CATEGORY FILTER TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 w-full">
          {categoryOptions.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={String(cat.id)}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-semibold text-sm">Menyelaraskan data...</p>
          </div>
        ) : filteredFinalists.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <Users className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-semibold">Belum ada delegasi untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
            {filteredFinalists.map((f) => (
              <div key={f.id} className="group bg-white p-2.5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] hover:border-emerald-100 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer">
                
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 font-black text-xs px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50">
                      #{f.no_urut}
                    </div>
                </div>

                <div className="px-2 pb-2 flex flex-col flex-grow">
                  <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight mb-1.5 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {f.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-500 font-medium truncate max-w-[85%]">
                        {f.role}
                      </p>
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity group-hover:bg-emerald-50 text-emerald-600">
                          <ArrowRight size={12} className="-rotate-45" />
                      </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. FAQ SECTION ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pusat Validasi</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base max-w-lg">Informasi resmi seputar transparansi profil delegasi dan mekanisme penentuan Juara Favorit Daerah.</p>
        </div>

        <div className="flex flex-col gap-3">
            {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden hover:border-emerald-100 transition-colors">
                <Collapse
                    title={item.title}
                    description={item.description}
                />
            </div>
            ))}
        </div>
      </section>

    </div>
  );
}