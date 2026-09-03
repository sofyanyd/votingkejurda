import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  PlusCircle, 
  LogOut,
  Menu,
  UserCog,
  ShieldCheck,
  Activity
} from "lucide-react";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const formatted = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    setCurrentDate(formatted);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, disabled = false }: { to: string, icon: any, label: string, disabled?: boolean }) => {
    const active = isActive(to);

    if (disabled) {
      return (
        <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-300 cursor-not-allowed opacity-60 transition-all duration-300 ${!isSidebarOpen && "justify-center px-0"}`}>
          <Icon size={18} />
          {isSidebarOpen && <span className="text-sm font-medium truncate">{label}</span>}
        </div>
      );
    }

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 border ${
          active
            ? "bg-emerald-50 text-emerald-700 font-bold border-emerald-100 shadow-sm"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold border-transparent"
        } ${!isSidebarOpen && "justify-center px-0 border-none"}`}
        title={!isSidebarOpen ? label : ""}
      >
        <Icon size={18} className={active ? "text-emerald-600" : "text-slate-400"} />
        {isSidebarOpen && <span className="text-sm truncate">{label}</span>}
        {isSidebarOpen && active && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] relative font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside 
        style={{ willChange: "width, transform" }}
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
          isSidebarOpen 
            ? "w-64 translate-x-0" 
            : "w-20 -translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 overflow-hidden flex-shrink-0">
          <div className="bg-slate-900 p-1.5 rounded-xl w-9 h-9 flex-shrink-0 flex items-center justify-center shadow-md shadow-slate-900/10">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          {isSidebarOpen && (
            <div className="whitespace-nowrap min-w-0 flex-1">
              <h1 className="font-black text-slate-800 text-sm leading-tight tracking-tight truncate flex items-center gap-1">
                KEJURDA <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-100 text-[10px]">26</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Admin Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/dashboard/finance" icon={Banknote} label="Rekap Keuangan" />
          
          {isSidebarOpen && (
            <div className="mt-6 mb-2 px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Manajemen Data
              </p>
            </div>
          )}
          <NavItem to="/dashboard/category" icon={Users} label="Kategori Pleton" />
          <NavItem to="/dashboard/pleton" icon={Users} label="Data Pleton" />
          <NavItem to="/dashboard/user" icon={UserCog} label="Akses Admin" />
          
          {isSidebarOpen && (
            <div className="mt-6 mb-2 px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> Konfigurasi Event
              </p>
            </div>
          )}
          <NavItem to="#" icon={PlusCircle} label="Kategori Event" disabled={true} />
          <NavItem to="#" icon={PlusCircle} label="Manajemen Event" disabled={true} />
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent transition-all font-bold text-sm shadow-sm ${!isSidebarOpen && "justify-center px-0 shadow-none border-none"}`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header / Topbar */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sm:px-8 flex-shrink-0 gap-4 z-10 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 hover:border-emerald-200 transition-all flex-shrink-0 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex flex-col">
              <h2 className="font-black text-slate-800 text-sm md:text-base leading-tight tracking-tight truncate">
                Pusat Kendali Sistem
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">FORBASI KOTA TEGAL</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs font-semibold bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentDate}
            </div> 
            
            <div className="flex items-center gap-3 bg-white py-1.5 pl-1.5 pr-4 rounded-full border border-slate-200 shadow-sm shadow-slate-100 cursor-pointer hover:border-emerald-200 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-xs group-hover:scale-105 transition-transform">
                {user ? user.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-900">
                {user || "Administrator"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Render Area */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
           <Outlet />
        </div>
      </main>
      
    </div>
  );
}