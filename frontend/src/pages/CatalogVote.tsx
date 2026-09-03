import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart, Info, ChevronUp, Ticket, Sparkles } from "lucide-react";
import { usePletonStore } from "../stores/pletonStore";
import { useTransactionStore } from "../stores/transactionStore";

export const IS_VOTING_CLOSED = false;

interface Participant {
  id: number;
  name: string;
  subName: string;
  price: number;
  imageUrl: string;
}

export default function CatalogVote() {
  const navigate = useNavigate();
  const { pletonList, loading, fetchPleton } = usePletonStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [cart, setCart] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    fetchPleton();
  }, []);

  const participants: (Participant & { categoryId: number })[] = pletonList.map((item) => {
    let subName = item.bidang;
    if (item.bidang.includes(" - ")) {
      subName = item.bidang.split(" - ")[1];
    }
    return {
      id: item.id,
      name: item.nama,
      subName: subName,
      price: 3000,
      imageUrl: item.foto_url || `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(item.nama)}`,
      categoryId: item.category_id || 1
    };
  });

  const categories = [
    { id: 1, name: "Kategori: SMA / SMK / MA Sederajat" },
    { id: 2, name: "Kategori: SMP / MTs Sederajat" },
    { id: 3, name: "Kategori: SD / MI Sederajat" },
    { id: 4, name: "Kategori: Purna / Umum" },
  ];

  const handleSubmitVotes = async () => {
    if (IS_VOTING_CLOSED) {
      alert("Voting telah ditutup. Pembelian suara baru tidak diizinkan.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await addTransaction(
        cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))
      );

      if (!result) {
        alert("Gagal membuat tagihan pembayaran. Pastikan server backend berjalan.");
        return;
      }

      navigate("/checkout", { 
        state: { cart, totalPrice, transactionCode: result.transactionCode, kodeUnik: result.kodeUnik, grandTotal: result.grandTotal } 
      });
    } catch (error) {
      alert("Gagal membuat tagihan pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQty = (participant: Participant, delta: number) => {
    if (IS_VOTING_CLOSED) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === participant.id);
      if (existingItem) {
        const newQty = existingItem.qty + delta;
        if (newQty <= 0) return prevCart.filter((item) => item.id !== participant.id);
        return prevCart.map((item) => item.id === participant.id ? { ...item, qty: newQty } : item);
      } else if (delta > 0) {
        return [...prevCart, { id: participant.id, name: participant.name, price: participant.price, qty: 1 }];
      }
      return prevCart;
    });
  };

  const getQty = (id: number) => cart.find((item) => item.id === id)?.qty || 0;
  const totalPrice = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  
  const hasItems = cart.length > 0;

  return (
    // DIUBAH: Menggunakan h-[100dvh] dan overflow-hidden agar halaman terkunci
    <div className="bg-[#F8FAFC] font-sans h-[100dvh] pt-[75px] md:pt-[96px] pb-0 md:pb-6 px-0 md:px-6 flex flex-col relative selection:bg-emerald-500 selection:text-white overflow-hidden">
      
      {/* Container Utama: flex-1 agar memenuhi sisa layar dengan overflow-hidden */}
      <div className="flex flex-col md:flex-row w-full h-full flex-1 bg-transparent md:bg-white md:rounded-[2rem] md:shadow-[0_10px_40px_rgb(0,0,0,0.04)] md:border border-slate-100 overflow-hidden relative">
        
        {/* ── KATALOG PESERTA (Area yang BISA di-scroll) ── */}
        <div className="w-full h-full md:bg-[#F8FAFC]/50 overflow-y-auto p-4 md:p-8 pb-[140px] md:pb-8 transition-all duration-300">
          
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors text-sm cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200/80"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              <Sparkles size={12} /> Official Store KEJURDA 2026
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mt-3 tracking-tight">
              Katalog <span className="text-emerald-600">Finalis & Kandidat</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-medium">Pilih delegasi daerah jagoanmu dari berbagai kategori dan gabungkan dalam 1 transaksi sekaligus.</p>
          </div>

          {IS_VOTING_CLOSED && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex items-start gap-3.5 mb-8 shadow-sm">
              <Info size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-sm">Voting Telah Ditutup</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Periode voting resmi untuk KEJURDA 2026 telah berakhir. Pembelian suara baru tidak lagi diizinkan. 
                  Silakan pantau perolehan suara akhir finalis di halaman Leaderboard!
                </p>
                <button 
                  onClick={() => navigate("/leaderboard")} 
                  className="mt-3 text-xs font-extrabold text-amber-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 bg-amber-100/80 hover:bg-amber-200 px-3.5 py-2 rounded-xl border border-amber-200 shadow-sm cursor-pointer"
                >
                  Pantau Hasil di Leaderboard &rarr;
                </button>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm">
              Memuat data katalog...
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm">
              Katalog kosong.
            </div>
          ) : (
            <div className="space-y-10">
              {categories.map((cat) => {
                const catParticipants = participants.filter((p) => p.categoryId === cat.id);
                if (catParticipants.length === 0) return null;
                return (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        {cat.name}
                      </h2>
                      <span className="text-xs font-bold text-slate-400">{catParticipants.length} Tim</span>
                    </div>

                    <div className={`grid grid-cols-2 lg:grid-cols-${hasItems ? '3' : '4'} xl:grid-cols-${hasItems ? '4' : '5'} gap-4 md:gap-6 transition-all duration-300`}>
                      {catParticipants.map((p) => {
                        const qty = getQty(p.id);
                        return (
                          <div key={p.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100/80 flex flex-col overflow-hidden group hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                            <div className="relative overflow-hidden bg-slate-100 aspect-square">
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            
                            <div className="p-4 md:p-5 flex flex-col flex-grow">
                              <h3 className="font-black text-slate-800 text-xs md:text-sm leading-tight line-clamp-1" title={p.name}>{p.name}</h3>
                              <p className="text-[10px] md:text-xs text-slate-400 truncate mt-1 font-semibold">{p.subName}</p>
                              <p className="font-black text-emerald-600 text-sm md:text-base mt-2.5 mb-4">Rp {p.price.toLocaleString("id-ID")}</p>

                              <div className="mt-auto">
                                {IS_VOTING_CLOSED ? (
                                  <button
                                    disabled
                                    className="w-full py-3 text-xs font-bold rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center"
                                  >
                                    Ditutup
                                  </button>
                                ) : qty === 0 ? (
                                  <button 
                                    onClick={() => handleUpdateQty(p, 1)}
                                    className="w-full py-3 text-xs font-black rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Ticket size={15} /> + Vote
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-between bg-emerald-50/80 rounded-2xl p-1.5 border border-emerald-100 shadow-inner">
                                    <button 
                                      onClick={() => handleUpdateQty(p, -1)}
                                      className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-100 cursor-pointer transition-colors"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="font-black text-emerald-900 text-xs md:text-sm">{qty}</span>
                                    <button 
                                      onClick={() => handleUpdateQty(p, 1)}
                                      className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition-colors"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── KANAN: KERANJANG VOTE (Hanya muncul jika sudah memilih item / Desktop) ── */}
        {hasItems && !IS_VOTING_CLOSED && (
          <div className="hidden md:flex w-80 xl:w-96 h-full flex-col bg-white border-l border-slate-100 relative z-10 animate-in fade-in slide-in-from-right duration-300">
            <div className="bg-slate-900 p-5 text-white flex items-center gap-2.5 shadow-sm z-20">
              <ShoppingCart size={20} className="text-emerald-400" />
              <h3 className="font-black text-base tracking-wide">Keranjang Otorisasi</h3>
            </div>

            {/* List Keranjang (Scrollable independen) */}
            <div className="flex-1 overflow-y-auto p-5 bg-white">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-3.5 gap-2">
                    <div>
                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-slate-400 font-semibold mt-0.5">{item.qty}x @ Rp{item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <p className="font-black text-emerald-600 text-sm whitespace-nowrap">
                      Rp {(item.qty * item.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/80 z-20">
              <div className="flex justify-between items-end mb-5">
                <span className="font-bold text-slate-500 text-sm">Total Tagihan</span>
                <span className="font-black text-emerald-600 text-xl leading-none">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <button 
                disabled={submitting}
                onClick={handleSubmitVotes}
                className="w-full py-4 rounded-2xl font-black text-sm transition-all flex justify-center items-center gap-2 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
              >
                {submitting ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FLOAT BAR KERANJANG MOBILE ── */}
      {hasItems && !IS_VOTING_CLOSED && (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] rounded-t-[2.5rem] transition-transform duration-300 ease-in-out animate-in slide-in-from-bottom duration-300">
          {isMobileCartOpen && (
            <div className="p-5 bg-slate-50 max-h-[40vh] overflow-y-auto rounded-t-[2.5rem] border-b border-slate-200">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm"><ShoppingCart size={16}/> Rincian Vote</h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-200/80 pb-2.5">
                    <div>
                      <p className="font-bold text-slate-700">{item.name}</p>
                      <p className="text-slate-400 font-semibold">{item.qty} x Rp {item.price}</p>
                    </div>
                    <p className="font-black text-emerald-600">Rp {(item.qty * item.price).toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 px-6 flex items-center justify-between gap-4">
            <div 
              className="flex-1 flex flex-col justify-center cursor-pointer group"
              onClick={() => setIsMobileCartOpen(!isMobileCartOpen)}
            >
              <div className="flex items-center gap-1 text-slate-500 mb-0.5 group-hover:text-emerald-600 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Total Belanja</span>
                <ChevronUp size={14} className={`transform transition-transform ${isMobileCartOpen ? "rotate-180" : ""}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-emerald-600 text-xl leading-none">Rp {totalPrice.toLocaleString("id-ID")}</span>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{totalItems} Tiket</span>
              </div>
            </div>

            <button 
              disabled={submitting}
              onClick={handleSubmitVotes}
              className="bg-emerald-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap cursor-pointer"
            >
              {submitting ? "Proses..." : "Bayar"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}