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
    { id: 1, label: "U16" },
    { id: 2, label: "U13" },
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
    // Kembali menggunakan background terang bersih (bg-[#F8FAFC]) selaras dengan homepage
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-24 md:pt-28 pb-24 selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. HERO SECTION: LIVE ARENA (DARK CARD YANG PAS SATU LAYAR) ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 pt-6 pb-10 md:pt-8 md:pb-12 relative overflow-hidden">
          
          {/* Animated Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
              <div className="absolute top-5 left-1/4 w-[250px] h-[250px] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-5 right-1/4 w-[250px] h-[250px] rounded-full bg-teal-500/20 blur-[100px]"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="mb-5 flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-1 rounded-full font-bold text-[11px] uppercase tracking-widest mb-3 shadow-sm backdrop-blur-sm">
                <Activity size={13} className="animate-pulse" /> Live Stats Berlangsung
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
                Klasemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Sementara</span>
              </h1>
              
              <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto font-medium">
                Pantau pergerakan suara KEJURDA 2026 secara real-time. Setiap otorisasi suara dapat mengubah sejarah.
              </p>

              {/* ── CATEGORY FILTER TABS ── */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5 mb-6">
                {categoryOptions.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={String(cat.id)}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-[1.03]"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── PODIUM DISPLAY (COMPACT & PAS) ── */}
            {loading ? (
              <div className="text-center py-6 flex flex-col items-center">
                  <div className="w-7 h-7 border-3 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
                  <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Menyinkronkan Server...</p>
              </div>
            ) : filteredStandings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium bg-slate-800/50 rounded-2xl border border-slate-700/50 max-w-md mx-auto text-sm">
                Sistem belum menerima otorisasi suara untuk kategori ini.
              </div>
            ) : (
              <div className="flex flex-row items-end justify-center gap-3 md:gap-5 max-w-3xl mx-auto px-2">
                
                {/* RANK 2 (SILVER) */}
                {topThree[1] && (
                  <div className="w-1/3 flex flex-col items-center order-1 group">
                    <div className="text-center mb-2 px-1 transition-transform group-hover:-translate-y-1">
                      <p className="font-bold text-slate-300 text-[10px] md:text-xs line-clamp-2 leading-snug mb-1">{topThree[1].nama}</p>
                      <div className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded text-slate-300 shadow-sm">
                          <span className="text-[10px] md:text-xs font-black">{topThree[1].votes.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 border-t-[3px] border-slate-400 rounded-t-xl p-2 h-18 md:h-24 flex flex-col items-center justify-start pt-2 shadow-lg relative overflow-hidden">
                      <Medal size={18} className="text-slate-400 mb-1 hidden md:block" />
                      <span className="text-2xl md:text-3xl font-black text-slate-400/40">2</span>
                    </div>
                  </div>
                )}

                {/* RANK 1 (GOLD) */}
                {topThree[0] && (
                  <div className="w-1/3 flex flex-col items-center order-2 group z-10">
                    <div className="text-center mb-2 md:mb-3 px-1 transition-transform group-hover:-translate-y-1.5">
                      <Crown size={22} className="text-amber-400 mx-auto mb-1 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                      <p className="font-black text-white text-xs md:text-sm line-clamp-2 leading-snug mb-1">{topThree[0].nama}</p>
                      <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-400 shadow-sm">
                          <span className="text-xs font-black">{topThree[0].votes.toLocaleString()}</span>
                          <span className="text-[9px] font-bold uppercase opacity-80 hidden md:inline">Votes</span>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-t from-amber-900/50 to-amber-800/30 border-t-[4px] border-amber-400 rounded-t-xl p-2 h-24 md:h-32 flex flex-col items-center justify-start pt-2 shadow-[0_-10px_25px_rgba(251,191,36,0.15)] relative overflow-hidden backdrop-blur-sm">
                      <Trophy size={22} className="text-amber-400 mb-1 hidden md:block" />
                      <span className="text-3xl md:text-4xl font-black text-amber-400/40">1</span>
                    </div>
                  </div>
                )}

                {/* RANK 3 (BRONZE) */}
                {topThree[2] && (
                  <div className="w-1/3 flex flex-col items-center order-3 group">
                    <div className="text-center mb-2 px-1 transition-transform group-hover:-translate-y-1">
                      <p className="font-bold text-slate-300 text-[10px] md:text-xs line-clamp-2 leading-snug mb-1">{topThree[2].nama}</p>
                      <div className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded text-slate-300 shadow-sm">
                          <span className="text-[10px] md:text-xs font-black">{topThree[2].votes.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 border-t-[3px] border-orange-400/80 rounded-t-xl p-2 h-14 md:h-20 flex flex-col items-center justify-start pt-2 shadow-lg relative overflow-hidden">
                      <Medal size={18} className="text-orange-400/80 mb-1 hidden md:block" />
                      <span className="text-xl md:text-2xl font-black text-orange-400/40">3</span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. DETAIL RANKING (FLOATING LIST) ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 mt-6 md:mt-8">
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden p-2 md:p-4">
          
          <div className="px-4 py-5 md:px-6 md:py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                Rekapitulasi Global
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Sisa kandidat di luar zona podium</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                <AlertCircle size={13} className="text-emerald-500" /> Diperbarui secara instan
            </div>
          </div>

          <div className="flex flex-col gap-2 p-2 md:p-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Menunggu aliran data...</div>
            ) : remainingStandings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                Semua kandidat aktif berada di podium.
              </div>
            ) : (
              remainingStandings.map((team) => (
                <div key={team.id} className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-900/5 rounded-2xl p-3.5 md:p-4 flex items-center transition-all duration-300">
                  
                  {/* Rank Number */}
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center shadow-sm transition-colors">
                    <span className="font-black text-slate-400 group-hover:text-emerald-600 text-sm md:text-base">#{team.displayRank}</span>
                  </div>
                  
                  {/* Team Info */}
                  <div className="ml-4 md:ml-5 flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800 text-xs md:text-sm truncate group-hover:text-emerald-700 transition-colors">{team.nama}</h3>
                      {team.category_nama && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 border border-slate-200/60">
                          {team.category_nama}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate mt-0.5">{team.instansi}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${team.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Votes Score */}
                  <div className="ml-4 flex flex-col items-end shrink-0">
                    <span className="font-black text-slate-900 group-hover:text-emerald-600 text-sm md:text-lg transition-colors">
                        {team.votes.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 border border-emerald-100">
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
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Informasi Klasemen</h2>
            <p className="text-slate-500 text-xs">Transparansi dan regulasi validasi data skor.</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {leaderboardFaqs.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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