import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Collapse } from "../components/ui/Collapse";
import { Trophy, Activity, AlertCircle, Medal, Crown } from "lucide-react";

export default function Leaderboard() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | "Semua">("Semua");

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/votes/leaderboard`);
        setStandings(res.data);
      } catch (error) {
        console.error("Gagal mengambil data leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
    // Polling setiap 10 detik untuk update real-time
    const interval = setInterval(fetchStandings, 10000);
    return () => clearInterval(interval);
  }, []);

  const categoryOptions = [
    { id: "Semua", label: "Semua Kategori" },
    { id: 2, label: "U13" },
    { id: 1, label: "U16" },
    { id: 3, label: "U19" },
    { id: 4, label: "Purna" },
  ];

  const leaderboardFaqs = [
    {
      title: "Seberapa akurat pergerakan data di Leaderboard ini?",
      description: "Sistem mencatat perolehan suara secara real-time. Fluktuasi angka dan perubahan posisi klasemen terjadi seketika setiap kali otorisasi vote divalidasi oleh server.",
    },
    {
      title: "Apakah status klasemen ini bersifat mutlak?",
      description: "Tidak. Ini merupakan akumulasi sementara (Live Stats). Keputusan final dan pengesahan Juara Favorit Daerah akan dideklarasikan oleh komite FORBASI pada malam puncak KEJURDA 2026.",
    },
    {
      title: "Bagaimana resolusi sistem jika terjadi 'Draw' (Seri)?",
      description: "Apabila terjadi perolehan suara identik di akhir periode, sistem klasemen akan dikunci dan panitia akan meninjau kriteria *tie-breaker* sesuai dengan regulasi resmi kompetisi.",
    },
  ];

  // Filter standings based on selectedCategory and assign fair ranks within the selected view
  const filteredStandings = (selectedCategory === "Semua"
    ? standings
    : standings.filter(item => item.category_id === Number(selectedCategory))
  ).map((item, idx) => ({
    ...item,
    displayRank: selectedCategory === "Semua" ? (item.categoryRank || idx + 1) : idx + 1
  }));

  const topThree = filteredStandings.slice(0, 3);
  const remainingStandings = filteredStandings.slice(3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 selection:bg-emerald-500 selection:text-white flex flex-col">
      
      {/* ── 1. HERO SECTION: FULL WIDTH DARK ARENA ── */}
      {/* Background melebar penuh seperti di Beranda, padding atas ditambahkan agar aman dari fixed header */}
      <section className="relative w-full bg-slate-950 pt-28 pb-32 md:pt-36 md:pb-40 border-b border-slate-900 overflow-hidden flex flex-col items-center">
        
        {/* Soft Background Glows & Patterns */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-50">
            <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-teal-500/20 blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-widest mb-4 shadow-sm backdrop-blur-sm">
            <Activity size={14} className="animate-pulse" /> Live Stats Berlangsung
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-3">
            Klasemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Sementara</span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-medium mb-8">
            Pantau pergerakan dukungan suara KEJURDA 2026 secara real-time. Setiap otorisasi suara berhak mengubah sejarah.
          </p>

          {/* ── CATEGORY FILTER TABS ── */}
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 w-full max-w-3xl mx-auto px-1">
            {categoryOptions.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={String(cat.id)}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
                      : "bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50 backdrop-blur-sm"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* ── PODIUM DISPLAY ── */}
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center">
                <div className="w-8 h-8 border-3 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Menyinkronkan Server...</p>
            </div>
          ) : filteredStandings.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-md max-w-md mx-auto text-sm w-full">
              Sistem belum menerima otorisasi suara untuk kategori ini.
            </div>
          ) : (
            <div className="flex flex-row items-end justify-center gap-3 md:gap-6 w-full max-w-3xl mx-auto px-2">
              
              {/* RANK 2 (SILVER) */}
              {topThree[1] && (
                <div className="w-1/3 flex flex-col items-center order-1 group">
                  <div className="text-center mb-3 px-1 transition-transform group-hover:-translate-y-1.5">
                    <p className="font-bold text-slate-200 text-xs md:text-sm line-clamp-2 leading-snug mb-1.5">{topThree[1].nama}</p>
                    <div className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-slate-300 shadow-sm backdrop-blur-sm">
                        <span className="text-xs md:text-sm font-black">{topThree[1].votes.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-[3px] md:border-t-[4px] border-slate-400 rounded-t-2xl p-2 md:p-4 h-24 md:h-32 flex flex-col items-center justify-start pt-3 shadow-2xl relative overflow-hidden">
                    <Medal size={24} className="text-slate-400 mb-1 hidden md:block drop-shadow-md" />
                    <span className="text-3xl md:text-4xl font-black text-slate-400/50">2</span>
                  </div>
                </div>
              )}

              {/* RANK 1 (GOLD) */}
              {topThree[0] && (
                <div className="w-1/3 flex flex-col items-center order-2 group z-10">
                  <div className="text-center mb-3 md:mb-5 px-1 transition-transform group-hover:-translate-y-2">
                    <Crown size={28} className="text-amber-400 mx-auto mb-1.5 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                    <p className="font-black text-white text-sm md:text-base line-clamp-2 leading-snug mb-2">{topThree[0].nama}</p>
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 px-3 md:px-4 py-1.5 rounded-xl text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)] backdrop-blur-md">
                        <span className="text-sm md:text-base font-black">{topThree[0].votes.toLocaleString()}</span>
                        <span className="text-[9px] font-bold uppercase opacity-80 hidden md:inline">Votes</span>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-900/40 to-amber-700/40 border-t-[4px] md:border-t-[6px] border-amber-400 rounded-t-2xl p-2 md:p-4 h-32 md:h-44 flex flex-col items-center justify-start pt-4 shadow-[0_-10px_40px_rgba(251,191,36,0.2)] relative overflow-hidden backdrop-blur-sm">
                    <Trophy size={32} className="text-amber-400 mb-1 hidden md:block drop-shadow-lg" />
                    <span className="text-4xl md:text-6xl font-black text-amber-400/40 drop-shadow-sm">1</span>
                  </div>
                </div>
              )}

              {/* RANK 3 (BRONZE) */}
              {topThree[2] && (
                <div className="w-1/3 flex flex-col items-center order-3 group">
                  <div className="text-center mb-3 px-1 transition-transform group-hover:-translate-y-1.5">
                    <p className="font-bold text-slate-200 text-xs md:text-sm line-clamp-2 leading-snug mb-1.5">{topThree[2].nama}</p>
                    <div className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-slate-300 shadow-sm backdrop-blur-sm">
                        <span className="text-xs md:text-sm font-black">{topThree[2].votes.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-[3px] md:border-t-[4px] border-orange-400/80 rounded-t-2xl p-2 md:p-4 h-20 md:h-28 flex flex-col items-center justify-start pt-3 shadow-2xl relative overflow-hidden">
                    <Medal size={24} className="text-orange-400/80 mb-1 hidden md:block drop-shadow-md" />
                    <span className="text-2xl md:text-3xl font-black text-orange-400/40">3</span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ── 2. DETAIL RANKING (FLOATING OVERLAP CARD) ── */}
      {/* Menggunakan margin minus (-mt-16 md:-mt-24) agar menumpuk elegan dengan Hero section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-20 -mt-16 md:-mt-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-white overflow-hidden p-2 md:p-4">
          
          <div className="px-4 py-5 md:px-6 md:py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">
                  Rekapitulasi Global
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Sisa kandidat di luar zona podium utama</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                <AlertCircle size={14} className="text-emerald-500" /> Diperbarui instan
            </div>
          </div>

          <div className="flex flex-col gap-2 p-2 md:p-3">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">Menunggu aliran data server...</div>
            ) : remainingStandings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">
                Semua kandidat aktif berada di podium.
              </div>
            ) : (
              remainingStandings.map((team) => (
                <div key={team.id} className="group bg-slate-50/50 hover:bg-white border border-transparent hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 rounded-2xl p-3.5 md:p-5 flex items-center transition-all duration-300">
                  
                  {/* Rank Number */}
                  <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center shadow-sm transition-colors">
                    <span className="font-black text-slate-400 group-hover:text-emerald-600 text-sm md:text-lg">#{team.displayRank}</span>
                  </div>
                  
                  {/* Team Info */}
                  <div className="ml-4 md:ml-5 flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
                      <h3 className="font-black text-slate-800 text-sm md:text-base truncate group-hover:text-emerald-700 transition-colors">{team.nama}</h3>
                      {team.category_nama && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 border border-slate-200/60 w-fit">
                          {team.category_nama}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider truncate">{team.instansi}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${team.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Votes Score */}
                  <div className="ml-4 flex flex-col items-end shrink-0">
                    <span className="font-black text-slate-900 group-hover:text-emerald-600 text-base md:text-xl transition-colors leading-none">
                        {team.votes.toLocaleString()}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mt-1.5 border border-emerald-100/60">
                        {team.percentage}%
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 3. FAQ SECTION ── */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Pusat Informasi Validasi</h2>
            <p className="text-slate-500 text-sm">Transparansi dan regulasi validasi data skor secara real-time.</p>
        </div>

        <div className="flex flex-col gap-3">
          {leaderboardFaqs.map((item, index) => (
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