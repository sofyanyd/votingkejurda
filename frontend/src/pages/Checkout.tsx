import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, QrCode, Clock, Trophy, Loader2, Copy, Check, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
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
  const [copied, setCopied] = useState(false);
  const checkStatusFn = useTransactionStore((state) => state.checkDokuPaymentStatus);

  const invoiceId = invoiceData?.invoiceId;
  const qrContent = invoiceData?.qrContent || "";
  const amount = invoiceData?.amount || totalPrice;
  const paymentMethod = invoiceData?.paymentMethod || "VA";
  const bankName = invoiceData?.bankName || "BRI / PERMATA";
  const paymentUrl = invoiceData?.paymentUrl;
  const howToPayPage = invoiceData?.howToPayPage;
  const vaNumber = invoiceData?.vaNumber || (qrContent.startsWith("VA:") ? qrContent.split(":")[2] : "");

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

  const handleCopyVa = () => {
    if (!vaNumber) return;
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <button onClick={() => navigate("/catalogvote")} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm">
            Kembali ke Katalog
          </button>
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
                Terima kasih, pembayaran sebesar <strong className="text-emerald-600 font-bold">{formatCurrency(amount)}</strong> telah terverifikasi secara otomatis oleh sistem DOKU.
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
                  Pembayaran <span className="text-emerald-600">Virtual Account {bankName}</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Transfer dari m-Banking bank manapun (GoPay, BCA, Mandiri, BRI, BNI, Dana, dll).
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xs font-bold text-amber-800">Menunggu Pembayaran</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* KIRI: VA CONTAINER */}
              <Card className="p-6 border-slate-200 flex flex-col items-center shadow-md">
                {paymentMethod === "VA" || vaNumber ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                        <Building2 size={16} className="text-emerald-600" /> Virtual Account {bankName} (DOKU Official)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">DOKU SNAP</span>
                    </div>

                    <div className="bg-slate-50 border-2 border-emerald-100 rounded-2xl p-4 w-full text-center mb-4 relative">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nomor Virtual Account (Resmi Terdaftar)</span>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 tracking-wider">
                        {vaNumber || "8965600000133938"}
                      </div>
                      
                      <button
                        onClick={handleCopyVa}
                        className="mt-3 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Berhasil Disalin!" : `Salin Nomor VA ${bankName}`}
                      </button>
                    </div>

                    {howToPayPage && (
                      <a
                        href={howToPayPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mb-4 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Building2 size={14} /> 💡 Petunjuk Cara Transfer Resmi DOKU &rarr;
                      </a>
                    )}

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2 rounded-xl mb-4 w-full justify-center">
                      <Clock size={14} className="text-emerald-600 animate-spin" />
                      <span>Sistem otomatis mendeteksi pembayaran</span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-900 p-4 rounded-2xl text-xs font-medium leading-relaxed w-full space-y-1.5">
                      <p className="font-bold text-emerald-950">💡 Cara Transfer (GoPay, BCA, Mandiri, Dana, dll):</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800">
                        <li>Buka aplikasi <strong className="font-bold">GoPay / m-Banking / E-Wallet</strong> Anda.</li>
                        <li>Pilih menu <strong className="font-bold">Transfer / Kirim Ke Rekening Bank</strong>.</li>
                        <li>Pilih Bank Tujuan: <strong className="font-bold">BANK {bankName}</strong>.</li>
                        <li>Masukkan Nomor VA: <strong className="font-bold">{vaNumber}</strong>.</li>
                        <li>Nama penerima akan otomatis terverifikasi dan pembayaran sukses!</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                        <QrCode size={16} className="text-emerald-600" /> Dynamic QRIS Code
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
                  </div>
                )}
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
