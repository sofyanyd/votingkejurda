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
  const activeStyle = "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20 scale-[1.02]"; 
  const defaultStyle = "text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 font-bold";

  // Style Mobile
  const mobileActiveStyle = "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20";
  const mobileDefaultStyle = "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-bold";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 shadow-[0_4px_25px_rgb(0,0,0,0.06)] py-2.5" 
        : "bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm py-3.5"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
        
        {/* ── Brand Logo Area ── */}
        <div className="logo">
          <Link to="/beranda" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-emerald-600 p-1.5 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
              <img src="/forbasi.png" alt="logo" className="h-full w-full object-contain filter brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 leading-none tracking-tight text-base md:text-lg">
                  KEJURDA
                </span>
                <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  '26
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 tracking-wider mt-0.5 flex items-center gap-1">
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
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
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
          <div className="pl-3 border-l border-slate-200">
             <Link 
                to="/login"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer"
             >
                <LogIn size={15} />
                <span>Masuk</span>
             </Link>
          </div>
        </div>

      </div>

      {/* ── Mobile Menu Dropdown Panel ── */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-slate-200 p-5 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 
                ${isActive ? mobileActiveStyle : mobileDefaultStyle}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="mt-2 pt-3 border-t border-slate-100">
             <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white px-5 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-emerald-600/20"
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