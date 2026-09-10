import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, QrCode, Clock, Trophy, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useTransactionStore } from "../stores/transactionStore";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];
  const totalPrice = location.state?.totalPrice || 0;
  const invoiceData = location.state?.invoiceData;

  const [paymentStatus, setPaymentStatus] = useState<string>(invoiceData?.status || "PENDING");
  const [simulating, setSimulating] = useState(false);
  const checkStatusFn = useTransactionStore((state) => state.checkDokuPaymentStatus);

  const invoiceId = invoiceData?.invoiceId;
  const qrContent = invoiceData?.qrContent || "";
  const amount = invoiceData?.amount || totalPrice;

  // Real-time status polling effect
  useEffect(() => {
    if (!invoiceId || paymentStatus === "PAID" || paymentStatus === "Lunas") return;

    const interval = setInterval(async () => {
      try {
        const res = await checkStatusFn(invoiceId);
        if (res && (res.status === "PAID" || res.status === "LUNAS")) {
          setPaymentStatus("PAID");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [invoiceId, paymentStatus, checkStatusFn]);

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

  // Helper function for Sandbox Simulator Testing
  const handleSimulateWebhook = async () => {
    if (!invoiceId || simulating) return;
    setSimulating(true);
    try {
      await axios.post(`${API_BASE_URL}/payment/doku/webhook`, {
        order: {
          invoice_number: invoiceId,
          amount: amount
        },
        transaction: {
          status: "SUCCESS",
          id: `SIM-REF-${Date.now()}`
        }
      });
      setPaymentStatus("PAID");
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Gagal memicu simulasi webhook.");
    } finally {
      setSimulating(false);
    }
  };

  if (!invoiceData && cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
          <p className="text-slate-500 font-bold mb-4">Sesi transaksi tidak ditemukan atau keranjang kosong.</p>
          <Button label="Kembali ke Catalog" variant="primary" onClick={() => navigate("/catalogvote")} />
        </div>
      </div>
    );
  }

  const isPaid = paymentStatus === "PAID" || paymentStatus === "Lunas";

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 pt-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate("/catalogvote")} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft size={20} /> Kembali ke Katalog
        </button>

        {isPaid ? (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-5 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={56} />
            </div>
            
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Pembayaran Sukses
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-2">Vote Kamu Sudah Masuk!</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Terima kasih, pembayaran sebesar <strong className="text-emerald-600 font-bold">{formatCurrency(amount)}</strong> telah terverifikasi secara otomatis oleh sistem.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 w-full text-left space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-slate-800">{invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Vote:</span>
                <span className="font-bold text-emerald-600">{cart.reduce((sum: number, i: any) => sum + i.qty, 0)} Suara</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/leaderboard")} 
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Trophy size={18} /> Lihat Papan Klasemen (Leaderboard)
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Pembayaran <span className="text-emerald-600">QRIS</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Scan QRIS menggunakan aplikasi Mobile Banking atau E-Wallet pilihanmu.</p>
              </div>
              
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xs font-bold text-amber-800">Menunggu Pembayaran</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* KIRI: QRIS DOKU CONTAINER */}
              <Card className="p-6 border-slate-200 flex flex-col items-center shadow-md">
                <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <QrCode size={16} className="text-emerald-600" /> QRIS Code
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">INV: {invoiceId}</span>
                </div>
                
                {qrContent ? (
                  <div className="flex flex-col items-center text-center w-full">
                    <div className="bg-white p-3.5 border-2 border-slate-200 rounded-3xl shadow-md mb-4 max-w-[260px] relative overflow-hidden group">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrContent)}`} 
                        alt="Dynamic QRIS DOKU" 
                        className="w-56 h-56 object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-xs">QRIS Dynamic DOKU</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2 rounded-xl mb-4 w-full justify-center">
                      <Clock size={14} className="text-emerald-600 animate-spin" />
                      <span>Sistem otomatis mendeteksi pembayaran</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-medium text-xs">
                    Memuat Kode QRIS...
                  </div>
                )}

                <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-900 p-4 rounded-2xl text-xs font-medium leading-relaxed w-full space-y-1">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    💡 Cara Pembayaran:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-emerald-800">
                    <li>Buka BCA, Mandiri, BRI, GoPay, OVO, Dana, LinkAja, atau Qris Scanner lain.</li>
                    <li>Scan Kode QRIS di atas.</li>
                    <li>Periksa nominal <strong className="font-bold">{formatCurrency(amount)}</strong> lalu bayar.</li>
                    <li>Status akan otomatis berubah menjadi <strong className="font-bold">PAID</strong> setelah berhasil.</li>
                  </ol>
                </div>

                {/* Developer Sandbox Test Button */}
                <button
                  onClick={handleSimulateWebhook}
                  disabled={simulating}
                  className="mt-4 text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors underline flex items-center gap-1 cursor-pointer"
                  title="Simulasikan notifikasi webhook DOKU untuk pengujian Sandbox"
                >
                  {simulating ? <Loader2 size={12} className="animate-spin" /> : "⚡ Test Sandbox: Simulasikan Pembayaran Sukses"}
                </button>
              </Card>

              {/* KANAN: RINGKASAN ORDER */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
                  <h3 className="font-black text-slate-900 mb-4 pb-3 border-b border-slate-100 text-lg">
                    Rincian Tagihan
                  </h3>
                  
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1 mb-4">
                    {cart.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-slate-500 font-medium text-xs">{item.qty} Vote x {formatCurrency(item.price || 2000)}</p>
                        </div>
                        <p className="font-black text-emerald-600">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-150 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">TOTAL VOTES</span>
                      <span className="font-black text-slate-800">{cart.reduce((sum: number, i: any) => sum + i.qty, 0)} Suara</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">NOMOR INVOICE</span>
                      <span className="font-mono font-bold text-slate-700">{invoiceId}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-650">Total Tagihan</span>
                      <span className="font-black text-emerald-600 text-xl">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
