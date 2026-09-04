import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button"; 
import { Ticket, Sparkles, ShieldCheck, CreditCard, Zap } from "lucide-react";

export default function Dukungan() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Ticket,
      title: "1. Pilih Tiket Vote",
      desc: "Masuk ke menu Katalog Voting dan tentukan jumlah kuota otorisasi suara yang ingin kamu amankan."
    },
    {
      icon: CreditCard,
      title: "2. Checkout & Bayar",
      desc: "Lakukan pembayaran secara instan dan aman menggunakan metode pembayaran standar QRIS atau e-wallet."
    },
    {
      icon: Zap,
      title: "3. Eksekusi Dukungan",
      desc: "Gunakan kuota tiketmu untuk mendongkrak posisi pleton delegasi jagoanmu di papan klasemen live!"
    }
  ];

  return (
    <div className="w-full bg-[#F8FAFC] font-sans min-h-screen pb-24 selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. HERO SECTION (Disamakan padding bawahnya pb-36 md:pb-44 agar simetris dengan halaman lain) ── */}
      <section className="relative w-full pt-36 pb-36 md:pt-44 md:pb-44 overflow-hidden flex flex-col items-center text-center px-6 border-b border-slate-100 bg-white">
        
        {/* Soft Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-60">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/50 blur-[100px] mix-blend-multiply"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/80 blur-[80px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles size={14} /> Official Ticketing Portal
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.15] mb-6">
            Otorisasi <span className="text-emerald-600">Dukunganmu</span>
          </h1>
          
          <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium mb-10 max-w-2xl">
            Bantu delegasi daerah kebanggaanmu merebut tahta Juara Favorit di KEJURDA 2026. Dapatkan tiket vote resmi dengan transparansi sistem penuh.
          </p>
          
          <Button 
              variant="primary" 
              onClick={() => navigate("/catalogvote")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 flex items-center justify-center gap-2 transition-all rounded-xl shadow-[0_8px_20px_rgb(16,185,129,0.2)] hover:-translate-y-1"
          >
              <Ticket size={20} />
              BELI TIKET VOTE SEKARANG
          </Button>
        </div>
      </section>

      {/* ── 2. MEKANISME PEMBELIAN ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 mt-12 mb-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10">
            <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Mekanisme Pembelian</h2>
                <p className="text-slate-500 text-sm">Tiga langkah mudah untuk mengamankan hak suara resmi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                                <Icon size={22} />
                            </div>
                            <h3 className="font-black text-slate-800 text-base mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* ── 3. ABOUT / SYSTEM TRANSPARENCY SECTION ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                <ShieldCheck size={32} />
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 tracking-tight">
                    Sistem Voting Transparan & Kredibel
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                    Kategori <strong className="text-slate-700">Juara Favorit</strong> murni dikalkulasi dari akumulasi dukungan publik secara adil. Seluruh transaksi tiket dan pencatatan suara diamankan menggunakan enkripsi server tingkat lanjut untuk mencegah manipulasi data.
                </p>
            </div>
        </div>
      </section>
      
    </div>
  );
}