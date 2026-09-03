import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Vote, 
  HelpCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Collapse } from "../components/ui/Collapse";

export default function Beranda() {
  const navigate = useNavigate();
  const [top3Leaderboard, setTop3Leaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop3 = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/votes/leaderboard`);
        const top3 = res.data.slice(0, 3).map((item: any) => ({
          rank: item.rank,
          name: item.nama,
          school: item.instansi,
          votes: item.votes,
          percentage: item.percentage
        }));
        setTop3Leaderboard(top3);
      } catch (error) {
        console.error("Gagal mengambil data Top 3:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTop3();
  }, []);

  const steps = [
    {
      step: "01",
      title: "Pilih Pleton",
      desc: "Jelajahi daftar peserta LKBB KEJURDA 2026 dan tentukan pleton jagoan sekolah Anda.",
      actionText: "Lihat Peserta",
      actionLink: "/peserta"
    },
    {
      step: "02",
      title: "Beli Suara Vote",
      desc: "Tentukan jumlah suara (Rp 3.000 / vote) dan lakukan pembayaran instant via QRIS dinamis.",
      actionText: "Katalog Vote",
      actionLink: "/catalogvote"
    },
    {
      step: "03",
      title: "Pantau Klasemen",
      desc: "Perolehan suara terverifikasi secara otomatis dan posisi klasemen diperbarui real-time.",
      actionText: "Live Leaderboard",
      actionLink: "/leaderboard"
    }
  ];

  const faqItems = [
    { 
      title: "Apakah voting ini resmi untuk KEJURDA 2026?", 
      description: "Ya, ini adalah platform pemungutan suara digital resmi panitia FORBASI untuk penentuan gelar Juara Favorit KEJURDA LKBB 2026." 
    },
    { 
      title: "Berapa biaya untuk 1 suara vote?", 
      description: "Dukungan dihitung sebesar Rp 3.000 per 1 suara vote. Anda dapat membeli jumlah vote sesuai keinginan." 
    },
    { 
      title: "Metode pembayaran apa saja yang didukung?", 
      description: "Pembayaran dapat dilakukan melalui scan QRIS dengan semua aplikasi M-Banking (BCA, Mandiri, BRI, BNI) maupun E-Wallet (GoPay, OVO, DANA, ShopeePay)." 
    },
    { 
      title: "Kapan periode voting ditutup?", 
      description: "Voting akan dikunci secara otomatis pada malam puncak penganugerahan KEJURDA 2026." 
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-slate-800 font-sans min-h-screen pt-16 selection:bg-emerald-600 selection:text-white">
      
      {/* ── 1. HERO SECTION (Clean, Obsidian Editorial Style) ── */}
      <section className="bg-[#0F172A] text-white pt-20 pb-24 md:pt-28 md:pb-32 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Official Live Voting Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
            Dukung Pleton Jagoanmu di <br className="hidden sm:inline" />
            <span className="text-emerald-400 font-black">KEJURDA FORBASI 2026</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed mb-10">
            Platform pemungutan suara resmi Juara Favorit LKBB Tingkat Jawa Tengah. Transparan, real-time, dan terverifikasi otomatis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate("/catalogvote")}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Vote size={18} />
              <span>Beli Suara Vote</span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full sm:w-auto border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy size={18} className="text-emerald-400" />
              <span>Lihat Klasemen</span>
            </button>
          </div>

          {/* Key Event Badges */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-3xl text-left sm:text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Event</p>
              <p className="font-bold text-sm text-slate-200 mt-1 flex items-center sm:justify-center gap-1.5">
                <Calendar size={14} className="text-emerald-400" /> 12 Juli 2026
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokasi Lomba</p>
              <p className="font-bold text-sm text-slate-200 mt-1 flex items-center sm:justify-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" /> Universitas BSI Tegal
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarif Suara</p>
              <p className="font-bold text-sm text-emerald-400 mt-1">Rp 3.000 / Vote</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. TOP 3 KLASEMEN SEMENTARA (Sleek Elevated Card) ── */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy size={18} className="text-emerald-400" />
              <h2 className="font-bold text-sm tracking-wide">Peringkat 3 Besar Sementara</h2>
            </div>
            <Link 
              to="/leaderboard" 
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Klasemen Lengkap <ChevronRight size={14} />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-2">
            {loading ? (
              <div className="col-span-3 py-10 text-center text-slate-400 text-xs font-semibold">
                Memuat klasemen sementara...
              </div>
            ) : top3Leaderboard.length === 0 ? (
              <div className="col-span-3 py-10 text-center text-slate-400 text-xs font-semibold">
                Belum ada suara masuk.
              </div>
            ) : (
              top3Leaderboard.map((item) => (
                <div key={item.rank} className="p-5 flex flex-col justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        item.rank === 1 ? "bg-amber-100 text-amber-900 border border-amber-200" :
                        item.rank === 2 ? "bg-slate-100 text-slate-800 border border-slate-200" :
                        "bg-orange-100 text-orange-900 border border-orange-200"
                      }`}>
                        #{item.rank}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {item.percentage}% Suara
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{item.school}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perolehan</span>
                    <span className="text-xl font-black text-emerald-600">{item.votes.toLocaleString("id-ID")} <span className="text-xs font-bold text-slate-400">suara</span></span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* ── 3. MEKANISME VOTING (Clean 3-Step Process) ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Alur Sederhana</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">3 Langkah Mudah Memberi Dukungan</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Proses voting berlangsung instant dengan konfirmasi QRIS dinamis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="font-black text-3xl text-slate-300 block mb-4">{s.step}</span>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">{s.desc}</p>
              </div>

              <Link 
                to={s.actionLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors pt-3 border-t border-slate-100"
              >
                <span>{s.actionText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. PERTANYAAN UMUM (Clean FAQ Accordion) ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pertanyaan Sering Diajukan</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">Informasi penting mengenai pelaksanaan voting KEJURDA 2026.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
          {faqItems.map((item, idx) => (
            <Collapse 
              key={idx}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

    </div>
  );
}