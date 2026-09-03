import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button"; 
import { Collapse } from "../components/ui/Collapse";
import { ShieldCheck, Ticket, BarChart3, ChevronRight, Trophy, Flame, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate(); 

    const faqItems = [
        { title: "Mengenai Voting KEJURDA 2026", description: "Sistem voting resmi dan eksklusif untuk menentukan Juara Favorit pada Lomba Keterampilan Baris Berbaris (LKBB) Tingkat Daerah (KEJURDA) Tahun 2026." },
        { title: "Bagaimana prosedur pemungutan suara?", description: "Akses menu 'Dukungan', dapatkan tiket resmi Anda, pilih delegasi daerah yang didukung, lalu konfirmasi pilihan Anda. Pastikan tiket Anda aktif." },
        { title: "Apakah ada batasan vote per akun?", description: "Sistem diatur berdasarkan regulasi kompetisi FORBASI Tingkat Daerah. Silakan cek detail pada halaman tiket." },
        { title: "Kapan akses voting ditutup?", description: "Live voting akan otomatis dikunci pada malam puncak penganugerahan. Jangan sampai delegasi Anda tertinggal!" },
        { title: "Bagaimana cara memantau pergerakan suara?", description: "Data suara masuk (incoming votes) ditampilkan secara real-time pada halaman Live Leaderboard." },
    ];

    const votingSteps = [
        {
            title: "Tentukan Pilihan",
            desc: `Analisis profil dan rekam jejak setiap delegasi daerah yang bertanding di KEJURDA 2026.`,
            btnLabel: "Lihat Kandidat",
            link: "/peserta",
            icon: ShieldCheck
        },
        {
            title: "Aktivasi Tiket",
            desc: `Gunakan tiket resmi sebagai akses valid untuk menyumbangkan suara ke dalam sistem.`,
            btnLabel: "Dapatkan Tiket",
            link: "/dukungan",
            icon: Ticket
        },
        {
            title: "Sumbang Suara",
            desc: `Konfirmasi dukungan Anda dan pantau pergeseran posisi mereka di klasemen daerah.`,
            btnLabel: "Live Klasemen",
            link: "/leaderboard",
            icon: BarChart3
        },
    ];

    // Data Mockup untuk Top 3 (Vibes lebih ke Live Stats)
    const top3Leaderboard = [
        { rank: 1, name: "Garda Wira Bumi", region: "Kota A", votes: "3,120", trend: "+120 hari ini", isHot: true },
        { rank: 2, name: "Paskibra SMAN 1", region: "Kabupaten B", votes: "2,450", trend: "+85 hari ini", isHot: false },
        { rank: 3, name: "Satria Muda", region: "Kota C", votes: "1,890", trend: "+40 hari ini", isHot: false },
    ];

    return (
        <div className="bg-gray-50 font-sans min-h-screen pb-20 selection:bg-emerald-500 selection:text-white">
            
            {/* HERO SECTION - TEMA GELAP (FOKUS TIPOGRAFI & CENTERED) */}
            <section className="relative bg-emerald-900 pt-16 pb-36 lg:pt-20 lg:pb-48 overflow-hidden flex flex-col justify-center">
                {/* Background Pattern / Grid modern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                
                {/* Aksen Gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-950/50 to-transparent pointer-events-none"></div>
                
                {/* Posisi Glow dipindah ke tengah atas agar sinkron dengan teks rata tengah */}
                <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 w-full px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center text-center">
                    
                    <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-700/50 backdrop-blur-sm text-emerald-300 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6 mt-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Voting Berlangsung
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Ajang Pembuktian <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">
                            Tingkat Daerah
                        </span>
                    </h1>
                    
                    <p className="text-emerald-100/80 text-base md:text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                        Selamat datang di panggung tertinggi KEJURDA 2026. Kawal delegasi kebanggaanmu dan tentukan siapa yang layak menduduki tahta Juara Favorit tahun ini.
                    </p>
                    
                    {/* Tombol Aksi Utama & Shortcut Klasemen */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Button 
                            variant="primary" 
                            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black border-none px-8 py-4 flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20" 
                            onClick={() => navigate("/dukungan")}
                        >
                            BERIKAN DUKUNGAN <ChevronRight size={18} />
                        </Button>

                        <Button 
                            variant="outline" 
                            className="w-full sm:w-auto bg-emerald-950/40 hover:bg-emerald-800/50 text-white font-bold border border-emerald-700/60 px-8 py-4 flex items-center justify-center gap-2 transition-all backdrop-blur-sm hover:scale-105" 
                            onClick={() => navigate("/leaderboard")}
                        >
                            <TrendingUp size={18} className="text-emerald-300" /> CEK KLASEMEN
                        </Button>
                    </div>
                </div>
            </section>

            {/* SEKSI LIVE STATS TOP 3 (Menembus antara Hero & Body) */}
            <section className="px-6 max-w-6xl mx-auto -mt-24 md:-mt-16 relative z-20">
                <div className="bg-white rounded-2xl shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden">
                    
                    <div className="bg-gray-50/50 border-b border-gray-100 px-6 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="text-emerald-600" size={24} />
                            <h2 className="text-xl font-black text-gray-900">Live Top 3 Klasemen</h2>
                        </div>
                        <Link to="/leaderboard" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
                            Lihat Semua Peringkat <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {top3Leaderboard.map((item, index) => (
                            <div key={index} className={`p-6 md:p-8 hover:bg-emerald-50/30 transition-colors ${item.rank === 1 ? 'relative overflow-hidden' : ''}`}>
                                {item.rank === 1 && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-10 rounded-bl-[100px]"></div>
                                )}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-3xl font-black ${item.rank === 1 ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        #{item.rank}
                                    </span>
                                    {item.isHot && (
                                        <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                                            <Flame size={12} /> ON FIRE
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="font-black text-gray-900 text-xl mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-500 font-medium mb-6">{item.region}</p>
                                
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Suara</p>
                                        <p className="text-2xl font-black text-emerald-600 leading-none">{item.votes}</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                                        {item.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEKSI MEKANISME (Lebih sleek, tidak rounded berlebihan) */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <div>
                        <p className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-2">Prosedur Official</p>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Mekanisme Validasi Suara</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {votingSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="group bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-lg font-black mb-3 text-gray-900 group-hover:text-emerald-700 transition-colors">{step.title}</h3>
                                <p className="text-sm text-gray-500 mb-8 leading-relaxed">{step.desc}</p>
                                <Link to={step.link} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                                    {step.btnLabel} <ChevronRight size={16} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SEKSI FAQ (Pusat Informasi Premium) */}
            <section className="py-20 px-6 max-w-4xl mx-auto mb-10">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-emerald-100/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Pusat Informasi <span className="text-emerald-600">Terpadu</span>
                    </h2>
                    <p className="text-gray-500 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
                        Direktori pertanyaan umum seputar regulasi, transparansi, dan mekanisme otorisasi suara pada sistem KEJURDA 2026.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-6 md:p-10 relative overflow-hidden">
                    {/* Aksen Background Glow di dalam Card */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="flex flex-col gap-3 relative z-10">
                        {faqItems.map((item, i) => (
                            <div key={i} className="group">
                                <Collapse 
                                    title={item.title} 
                                    description={item.description} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
        </div>
    );
}