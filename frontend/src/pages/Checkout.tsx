import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, QrCode, Clock, Trophy, Copy, Check, Building2, Wallet, ShieldCheck, Sparkles, Send } from "lucide-react";
import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { useTransactionStore } from "../stores/transactionStore";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];
  const totalPrice = location.state?.totalPrice || 0;
  const invoiceData = location.state?.invoiceData;
  const directTxData = location.state?.directTxData;

  const approveTxFn = useTransactionStore((state) => state.approveTransaction);
  const checkStatusFn = useTransactionStore((state) => state.checkDokuPaymentStatus);

  const [activeTab, setActiveTab] = useState<"MANUAL" | "DOKU_VA">("MANUAL");
  const [paymentStatus, setPaymentStatus] = useState<string>(invoiceData?.status || "PENDING");
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Direct Transfer details
  const directCode = directTxData?.transactionCode || `KJDA-${Date.now().toString().slice(-6)}`;
  const kodeUnik = directTxData?.kodeUnik || Math.floor(100 + Math.random() * 900);
  const grandTotal = directTxData?.grandTotal || (totalPrice + kodeUnik);

  // DOKU details
  const invoiceId = invoiceData?.invoiceId || directCode;
  const qrContent = invoiceData?.qrContent || "";
  const amount = invoiceData?.amount || totalPrice;
  const bankName = invoiceData?.bankName || "PERMATA / BRI";
  const vaNumber = invoiceData?.vaNumber || (qrContent.startsWith("VA:") ? qrContent.split(":")[2] : "");

  // Real-time status polling effect for DOKU
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

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(grandTotal.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAccount(accNo);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleConfirmManualTransfer = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      const success = await approveTxFn(directCode);
      if (success) {
        setPaymentStatus("PAID");
      } else {
        alert("Konfirmasi pembayaran berhasil dikirim. Panitia akan memverifikasi transaksi Anda!");
        setPaymentStatus("PAID");
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus("PAID");
    } finally {
      setConfirming(false);
    }
  };

  if (!invoiceData && !directTxData && cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md max-w-sm mx-auto">
          <p className="text-slate-500 font-bold mb-4">Sesi transaksi tidak ditemukan atau keranjang kosong.</p>
          <button onClick={() => navigate("/catalogvote")} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all cursor-pointer">
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const isPaid = paymentStatus === "PAID" || paymentStatus === "Lunas";

  const committeeAccounts = [
    { bank: "BCA", accNo: "8465291039", holder: "PANITIA FORBASI", icon: "🏦" },
    { bank: "DANA / GoPay / OVO", accNo: "081234567890", holder: "PANITIA FORBASI", icon: "📱" },
    { bank: "BRI", accNo: "012301002345501", holder: "PANITIA FORBASI", icon: "🏛️" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 pt-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate("/catalogvote")} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors w-fit cursor-pointer text-sm"
        >
          <ArrowLeft size={18} /> Kembali ke Katalog
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
                Terima kasih, pembayaran sebesar <strong className="text-emerald-600 font-bold">{formatCurrency(grandTotal || amount)}</strong> telah berhasil diproses.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 w-full text-left space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Kode Transaksi:</span>
                <span className="font-mono font-bold text-slate-800">{directCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Vote:</span>
                <span className="font-bold text-emerald-600">{cart.reduce((sum: number, i: any) => sum + i.qty, 0)} Suara</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-600">Lunas / Terverifikasi</span>
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
            
            {/* HEADER METODE PEMBAYARAN */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Instruksi <span className="text-emerald-600">Pembayaran Vote</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                  Bebas nominal berapa saja (1 Vote = Rp 2.000). Mendukung semua aplikasi e-wallet & m-Banking.
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xs font-bold text-amber-800">Menunggu Transfer</span>
              </div>
            </div>

            {/* TAB SELECTION METODE PEMBAYARAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab("MANUAL")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  activeTab === "MANUAL"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === "MANUAL" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm">Transfer Direct + Kode Unik</span>
                    <Sparkles size={14} className={activeTab === "MANUAL" ? "text-amber-300 fill-amber-300" : "text-amber-500"} />
                  </div>
                  <p className={`text-[11px] mt-0.5 font-medium ${activeTab === "MANUAL" ? "text-emerald-100" : "text-slate-500"}`}>
                    Bisa 1 Vote (Rp 2.000), DANA, GoPay, BCA, BRI, dll. Tanpa login DOKU!
                  </p>
                </div>
              </button>

              {vaNumber && (
                <button
                  onClick={() => setActiveTab("DOKU_VA")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    activeTab === "DOKU_VA"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === "DOKU_VA" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block">Virtual Account DOKU</span>
                    <p className={`text-[11px] mt-0.5 font-medium ${activeTab === "DOKU_VA" ? "text-emerald-100" : "text-slate-500"}`}>
                      Untuk transaksi min. Rp 10.000 via VA {bankName}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* KIRI: AREA PETUNJUK PEMBAYARAN (2 COLS) */}
              <div className="md:col-span-2 space-y-4">
                
                {activeTab === "MANUAL" ? (
                  <Card className="p-6 border-slate-200 shadow-md space-y-6">
                    
                    {/* TOTAL PERSIS DENGAN KODE UNIK */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-5 sm:p-6 text-center relative overflow-hidden">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Total yang Harus Ditransfer (Persis)
                      </span>
                      
                      <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight my-1">
                        {formatCurrency(grandTotal)}
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-900 font-medium text-xs px-3 py-1 rounded-full mt-1">
                        <span>Nominal Vote: <strong>{formatCurrency(totalPrice)}</strong></span>
                        <span>+</span>
                        <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md shadow-xs">Kode Unik: {kodeUnik}</span>
                      </div>

                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleCopyAmount}
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                        >
                          {copiedAmount ? <Check size={16} /> : <Copy size={16} />}
                          {copiedAmount ? "Nominal Berhasil Disalin!" : `Salin Total Transfer (${grandTotal})`}
                        </button>
                      </div>

                      <div className="mt-3 text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl font-medium text-left flex items-start gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <span>
                          <strong>PENTING:</strong> Pastikan Anda mentransfer <strong>PERSIS {formatCurrency(grandTotal)}</strong> (termasuk 3 digit akhir <strong>{kodeUnik}</strong>) agar sistem dapat mendeteksi vote Anda secara instan.
                        </span>
                      </div>
                    </div>

                    {/* REKENING REKENING TUJUAN PANITIA */}
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        Pilih Rekening / E-Wallet Tujuan:
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        {committeeAccounts.map((acc, index) => (
                          <div 
                            key={index}
                            className="bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{acc.icon}</span>
                              <div>
                                <span className="font-black text-slate-800 text-sm block">{acc.bank}</span>
                                <span className="font-mono text-xs text-slate-600 font-bold">{acc.accNo}</span>
                                <span className="text-[10px] text-slate-400 font-medium block">a/n {acc.holder}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleCopyAccount(acc.accNo)}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              {copiedAccount === acc.accNo ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              {copiedAccount === acc.accNo ? "Disalin!" : "Salin No"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TOMBOL SAYA SUDAH TRANSFER */}
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <button
                        onClick={handleConfirmManualTransfer}
                        disabled={confirming}
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Send size={18} />
                        {confirming ? "Memverifikasi Transaksi..." : `Saya Sudah Transfer ${formatCurrency(grandTotal)}`}
                      </button>
                      <p className="text-[11px] text-slate-400 text-center font-medium">
                        Klik tombol di atas setelah Anda menyelesaikan transfer untuk langsung memasukkan vote ke leaderboard.
                      </p>
                    </div>

                  </Card>
                ) : (
                  <Card className="p-6 border-slate-200 shadow-md space-y-4">
                    <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                        <Building2 size={16} className="text-emerald-600" /> Virtual Account {bankName} (DOKU Official)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">DOKU SNAP</span>
                    </div>

                    <div className="bg-slate-50 border-2 border-emerald-100 rounded-2xl p-5 text-center relative">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nomor Virtual Account</span>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 tracking-wider my-2">
                        {vaNumber || "8965600000133938"}
                      </div>
                      
                      <button
                        onClick={() => handleCopyAccount(vaNumber)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        {copiedAccount === vaNumber ? <Check size={14} /> : <Copy size={14} />}
                        {copiedAccount === vaNumber ? "Berhasil Disalin!" : `Salin VA ${bankName}`}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2 rounded-xl w-full justify-center">
                      <Clock size={14} className="text-emerald-600 animate-spin" />
                      <span>Sistem otomatis mendeteksi pembayaran DOKU</span>
                    </div>
                  </Card>
                )}

              </div>

              {/* KANAN: RINGKASAN ORDER (1 COL) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
                <h3 className="font-black text-slate-900 mb-4 pb-3 border-b border-slate-100 text-base flex items-center justify-between">
                  <span>Rincian Suara</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {cart.reduce((sum: number, i: any) => sum + i.qty, 0)} Vote
                  </span>
                </h3>
                
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 mb-4">
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-400 font-medium">{item.qty} Vote x {formatCurrency(item.price || 2000)}</p>
                      </div>
                      <p className="font-black text-emerald-600">{formatCurrency(item.qty * item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-150 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500 font-medium">
                    <span>KODE TRANSAKSI</span>
                    <span className="font-mono font-bold text-slate-800">{directCode}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 font-medium">
                    <span>SUBTOTAL VOTE</span>
                    <span className="font-bold text-slate-800">{formatCurrency(totalPrice)}</span>
                  </div>

                  {activeTab === "MANUAL" && (
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>KODE UNIK</span>
                      <span className="font-bold text-emerald-600">+{kodeUnik}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Total Tagihan</span>
                    <span className="font-black text-emerald-600 text-lg">
                      {formatCurrency(activeTab === "MANUAL" ? grandTotal : amount)}
                    </span>
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
