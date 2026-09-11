import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16 border-t-4 border-emerald-600 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
        
        {/* ── INFO BRAND & TENTANG ACARA ── */}
        <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-6">
          <Link to="/beranda" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center shadow-sm">
              <img src="/forbasi.png" alt="FORBASI" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white leading-none tracking-tight text-xl">KEJURDA</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Jawa Tengah 2026</span>
            </div>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Platform official ticketing dan live leaderboard untuk Lomba Kejuaraan Daerah. Mari dukung pleton kebanggaanmu menjadi Juara Favorit!
          </p>
        </div>

        {/* ── TAUTAN CEPAT ── */}
        <div className="md:col-span-3 lg:col-span-2">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Navigasi
          </h3>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Beranda", path: "/beranda" },
              { label: "Peserta", path: "/peserta" },
              { label: "Leaderboard", path: "/leaderboard" },
              { label: "Dukungan", path: "/dukungan" },
            ].map((link, i) => (
              <li key={i}>
                <Link to={link.path} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-emerald-600">›</span> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── LOKASI & KONTAK ACARA (DENGAN MAPS) ── */}
        <div className="md:col-span-5 lg:col-span-5">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lokasi Acara
          </h3>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <ul className="flex flex-col gap-4 mb-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <span className="text-slate-300">
                  <strong className="text-white block mb-0.5">Universitas Harkat Negeri</strong>
                   Jl. Mataram No.9 Pesurungan Lor, Kec. Margadana, Kota Tegal, Jawa Tengah 52147
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="text-emerald-500 shrink-0" size={18} />
                <span className="text-slate-300">+6289605997177 (Arda)</span>
              </li>
            </ul>
            
            {/* Embed Google Maps */}
            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.184592532426!2d109.10534437458405!3d-6.868471367201109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fb761159fca85%3A0x1a640939cc7a18c3!2sUniversitas%20Harkat%20Negeri!5e0!3m2!1sid!2sid!4v1788976766481!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi KEJURCADA 2026"
              ></iframe>
            </div>
          </div>
        </div>

      </div>

      {/* ── COPYRIGHT ── */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 text-center md:text-left">
          © {new Date().getFullYear()} FORBASI Kota Tegal. Hak cipta dilindungi undang-undang.
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          
        </p>
      </div>
    </footer>
  );
}