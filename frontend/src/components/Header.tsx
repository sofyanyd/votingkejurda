import React, { useState, useEffect } from "react";
import { Home, Users, Trophy, Ticket, LogIn, Menu, X, Sparkles } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efek bayangan & transparansi saat halaman di-scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Beranda", href: "/beranda", icon: <Home size={15} /> },
    { label: "Peserta", href: "/peserta", icon: <Users size={15} /> },
    { label: "Leaderboard", href: "/leaderboard", icon: <Trophy size={15} /> },
    { label: "Dukungan", href: "/dukungan", icon: <Ticket size={15} /> },
  ];

  // Style Navigasi Desktop yang super clean & modern pill style
  const activeStyle = "bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/25 scale-[1.02]"; 
  const defaultStyle = "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold";

  // Style Mobile
  const mobileActiveStyle = "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20";
  const mobileDefaultStyle = "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_10px_30px_rgb(0,0,0,0.03)] py-3" 
        : "bg-white/60 backdrop-blur-md border-b border-slate-100 py-4"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8">
        
        {/* ── Brand Logo Area ── */}
        <div className="logo">
          <Link to="/beranda" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 p-1.5 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-slate-200/70 group-hover:scale-105 transition-transform duration-300">
              <img src="/forbasi.png" alt="logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
                <span className="font-black text-slate-900 leading-none tracking-tight text-base md:text-lg flex items-center gap-1.5">
                  KEJURDA 
                  <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80">
                    '26
                  </span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Official Arena
                </span>
            </div>
          </Link>
        </div>

        {/* ── Mobile Hamburger Button ── */}
        <button 
          className="md:hidden p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* ── Desktop Navigation ── */}
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all duration-300 
                  ${isActive ? activeStyle : defaultStyle}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Login / Action Button */}
          <div className="pl-3 border-l border-slate-200/80">
             <Link 
                to="/login"
                className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-emerald-600/30 hover:-translate-y-0.5"
             >
                <LogIn size={15} />
                <span>Masuk</span>
             </Link>
          </div>
        </div>

      </div>

      {/* ── Mobile Menu Dropdown Panel ── */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 p-6 shadow-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 
                ${isActive ? mobileActiveStyle : mobileDefaultStyle}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="mt-3 pt-3 border-t border-slate-100">
             <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-emerald-600 text-white px-5 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-slate-900/10"
             >
                <LogIn size={16} />
                <span>Masuk / Login</span>
             </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;