import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  MapPin, 
  Calendar,
  CreditCard,
  Users,
  Trophy,
  Vote
} from "lucide-react";
import { usePletonStore } from "../../stores/pletonStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function Dashboard() {
  const { pletonList, fetchPleton, loading: loadingPleton } = usePletonStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchPleton();
    fetchTransactions();
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
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-12">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pleton", value: loading ? "..." : String(totalPleton), icon: Users, color: "bg-[#00a54f]" },
          { label: "Total Voting Masuk", value: loading ? "..." : totalVotes.toLocaleString("id-ID"), icon: Vote, color: "bg-blue-500" },
          { label: "Total Keuangan", value: loading ? "..." : formatCurrency(totalFinance), icon: CreditCard, color: "bg-emerald-500" },
          { label: "Status Voting", value: "Berjalan", icon: CheckCircle, color: "bg-indigo-500" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`${item.color} p-2.5 rounded-xl`}>
              <item.icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{item.value}</h3>
              <p className="text-[10px] sm:text-xs font-medium text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00a54f] via-[#008f44] to-[#007a3a] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#007a3a]/30 rounded-full blur-2xl transform translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 border border-white/20 shadow-sm">
              <MapPin size={14} />
              Lokasi Forbasi Tegal
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
              Selamat Datang! <span className="animate-wave inline-block origin-bottom-right">👋</span>
            </h1>
            <p className="text-green-50 text-sm md:text-base font-medium">
              Kelola pleton, pantau keuangan, dan atur event dengan mudah
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-left md:text-right">
            <div>
              <p className="text-green-55 text-[10px] font-bold tracking-widest uppercase mb-1">HARI INI</p>
              <p className="font-bold text-sm sm:text-lg">Minggu, 12 Jul</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 transition-colors p-4 sm:p-5 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm cursor-pointer">
              <Calendar size={20} className="text-white sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Keuangan", value: loading ? "..." : formatCurrency(totalFinance), icon: CreditCard, color: "bg-emerald-500", link: "/dashboard/finance" },
          { label: "Total Pleton", value: loading ? "..." : String(totalPleton), icon: Users, color: "bg-[#00a54f]", link: "/dashboard/pleton" },
          { label: "Event Lomba", value: "1", icon: Trophy, color: "bg-purple-500", link: "#" },
        ].map((item, idx) => (
          <Link key={idx} to={item.link} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`${item.color} p-2.5 rounded-xl`}>
              <item.icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{item.value}</h3>
              <p className="text-[10px] sm:text-xs font-medium text-gray-500">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Kelola Pleton", desc: "Manajemen data pleton", icon: Users, link: "/dashboard/pleton" },
          { title: "Kelola Keuangan", desc: "Pantau data transaksi", icon: CreditCard, link: "/dashboard/finance" },
        ].map((action, idx) => (
          <Link key={idx} to={action.link} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-green-50 p-2.5 rounded-xl w-fit mb-3">
              <action.icon size={20} className="text-[#00a54f]" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm mb-0.5">{action.title}</h4>
            <p className="text-[11px] text-gray-500 font-medium">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}