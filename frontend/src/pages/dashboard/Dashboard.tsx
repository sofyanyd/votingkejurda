import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  MapPin, 
  Calendar,
  CreditCard,
  Users,
  Trophy,
  Vote,
  ArrowRight,
  Activity,
  Wallet
} from "lucide-react";
import { usePletonStore } from "../../stores/pletonStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function Dashboard() {
  const { pletonList, fetchPleton, loading: loadingPleton } = usePletonStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    fetchPleton();
    fetchTransactions();
    
    // Set tanggal dinamis
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('id-ID', dateOptions));
  }, []);

  const totalPleton = pletonList.length;

  const totalVotes = transactions
    .filter((tx) => tx.status === "Lunas")
    .reduce((sum, tx) => sum + (tx.votesCount || 0), 0);

  const totalFinance = transactions
    .filter((tx) => tx.status === "Lunas")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const loading = loadingPleton;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("Rp", "Rp ");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 pb-12 font-sans">
      
      {/* ── 1. COMMAND CENTER BANNER (Sleek Dark Mode) ── */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] transform translate-y-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 border border-slate-700/50 mb-5">
              <Activity size={14} className="text-emerald-400" /> Admin Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white">
              Halo, Administrator!
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">
              Pantau arus data pleton, validasi suara, dan rekapitulasi keuangan secara real-time.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-800/50 px-5 py-4 rounded-2xl border border-slate-700/50 backdrop-blur-md">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar size={22} />
            </div>
            <div className="text-left">
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">Hari Ini</p>
              <p className="font-bold text-sm text-slate-100">{currentDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KEY PERFORMANCE INDICATORS (KPI) ── */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4 px-1">Ikhtisar Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            { label: "Total Kontingen", value: loading ? "..." : String(totalPleton), icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Validasi Suara", value: loading ? "..." : totalVotes.toLocaleString("id-ID"), icon: Vote, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
            { label: "Total Pendapatan", value: loading ? "..." : formatCurrency(totalFinance), icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Status Sistem", value: "Online", icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-200 transition-colors">
              <div className="flex justify-between items-start">
                <div className={`${item.bg} ${item.color} ${item.border} border p-3 rounded-xl`}>
                  <item.icon size={22} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{item.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. QUICK NAVIGATION (Action Cards) ── */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4 px-1">Pintasan Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            { title: "Manajemen Pleton", desc: "Kelola data, foto, dan asal instansi peserta.", icon: Users, link: "/dashboard/pleton" },
            { title: "Rekap Keuangan", desc: "Pantau arus kas dan validasi pembayaran tiket.", icon: CreditCard, link: "/dashboard/finance" },
            { title: "Pengaturan Event", desc: "Konfigurasi detail acara dan klasemen.", icon: Trophy, link: "#" },
          ].map((action, idx) => (
            <Link key={idx} to={action.link} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center justify-between group hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer">
              <div className="flex flex-col gap-3">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl w-fit text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                  <action.icon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1 group-hover:text-emerald-700 transition-colors">{action.title}</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[85%] leading-relaxed">{action.desc}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}