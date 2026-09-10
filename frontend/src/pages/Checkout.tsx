import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Trophy, Copy, Check, Building2, Smartphone, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import Card from "../components/ui/Card";
import { useTransactionStore } from "../stores/transactionStore";

type PayTab = "GOPAY" | "VA_PERMATA";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];
  const totalPrice = location.state?.totalPrice || 0;
  const invoiceData = location.state?.invoiceData;

  const checkStatusFn = useTransactionStore((state) => state.checkDokuPaymentStatus);

  const [paymentStatus, setPaymentStatus] = useState<string>(invoiceData?.status || "PENDING");
  const [activeTab, setActiveTab] = useState<PayTab>("GOPAY");
  const [copiedVa, setCopiedVa] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const invoiceId = invoiceData?.invoiceId;
  const amount    = invoiceData?.amount || totalPrice;
  const paymentUrl = invoiceData?.paymentUrl;        // GoPay / DOKU Checkout URL
  const vaNumber   = invoiceData?.vaNumber || "";    // VA Permata number
  const bankName   = invoiceData?.bankName || "PERMATA";
  const howToPayPage = invoiceData?.howToPayPage;
  // Jika ada VA number, default tab ke VA; kalau ada paymentUrl, default ke GoPay
  useEffect(() => {
    if (paymentUrl) setActiveTab("GOPAY");
    else if (vaNumber) setActiveTab("VA_PERMATA");
  }, [paymentUrl, vaNumber]);

  // Real-time status polling (DOKU webhook sudah mengupdate DB)
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

  const handleCopyVa = () => {
    if (!vaNumber) return;
    navigator.clipboard.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  // Sandbox webhook simulator
  const handleSimulateWebhook = async () => {
    if (!invoiceId || simulating) return;
    setSimulating(true);
    try {
      await axios.post(`${API_BASE_URL}/payment/doku/webhook`, {
        order: { invoice_number: invoiceId, amount },
        transaction: { status: "SUCCESS", id: `SIM-REF-${Date.now()}` }
      });
      setPaymentStatus("PAID");
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setSimulating(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })
      .format(value)
      .replace("Rp", "Rp ");

  if (!invoiceData && cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
          <p className="text-slate-500 font-bold mb-4">Sesi transaksi tidak ditemukan atau keranjang kosong.</p>
          <button onClick={() => navigate("/catalogvote")} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm cursor-pointer">
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const isPaid = paymentStatus === "PAID" || paymentStatus === "Lunas";

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <button
          onClick={() => navigate("/catalogvote")}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft size={20} /> Kembali ke Katalog
        </button>

        {isPaid ? (
          /* ═══════════════ PAID STATE ═══════════════ */
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-5 max-w-xl mx-auto">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={56} />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Pembayaran Sukses
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-2">Vote Kamu Sudah Masuk!</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Terima kasih, pembayaran sebesar{" "}
                <strong className="text-emerald-600">{formatCurrency(amount)}</strong> telah terverifikasi.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full text-left space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-slate-800">{invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Vote:</span>
                <span className="font-bold text-emerald-600">{cart.reduce((s: number, i: any) => s + i.qty, 0)} Suara</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy size={18} /> Lihat Papan Klasemen
            </button>
          </div>
        ) : (
          /* ═══════════════ PENDING STATE ═══════════════ */
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Pilih <span className="text-emerald-600">Metode Pembayaran</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                  Invoice <span className="font-mono font-bold text-slate-700">{invoiceId}</span> · Total{" "}
                  <strong className="text-emerald-700">{formatCurrency(amount)}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-amber-800">Menunggu Pembayaran</span>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tab GoPay */}
              <button
                onClick={() => setActiveTab("GOPAY")}
                disabled={!paymentUrl}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === "GOPAY"
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === "GOPAY" ? "bg-white/20" : "bg-[#00AED6]/10"}`}>
                  <Smartphone size={22} className={activeTab === "GOPAY" ? "text-white" : "text-[#00AED6]"} />
                </div>
                <div>
                  <span className="font-extrabold text-sm block">GoPay</span>
                  <p className={`text-[11px] mt-0.5 font-medium ${activeTab === "GOPAY" ? "text-emerald-100" : "text-slate-500"}`}>
                    Bayar langsung lewat aplikasi GoPay/Gojek
                  </p>
                </div>
              </button>

              {/* Tab VA Permata */}
              <button
                onClick={() => setActiveTab("VA_PERMATA")}
                disabled={!vaNumber}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === "VA_PERMATA"
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === "VA_PERMATA" ? "bg-white/20" : "bg-purple-50"}`}>
                  <Building2 size={22} className={activeTab === "VA_PERMATA" ? "text-white" : "text-purple-600"} />
                </div>
                <div>
                  <span className="font-extrabold text-sm block">Transfer VA {bankName}</span>
                  <p className={`text-[11px] mt-0.5 font-medium ${activeTab === "VA_PERMATA" ? "text-emerald-100" : "text-slate-500"}`}>
                    Transfer dari m-Banking / e-Wallet manapun
                  </p>
                </div>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">

              {/* KIRI: Detail Pembayaran (3/5) */}
              <div className="md:col-span-3">
                <Card className="p-6 border-slate-200 shadow-md">

                  {/* ─── TAB: GOPAY ─── */}
                  {activeTab === "GOPAY" && (
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <Smartphone size={15} className="text-[#00AED6]" /> Bayar via GoPay
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">DOKU CHECKOUT</span>
                      </div>

                      <div className="bg-gradient-to-br from-[#00AED6]/10 to-emerald-50 border-2 border-[#00AED6]/30 rounded-2xl p-6 w-full text-center space-y-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Pembayaran</span>
                        <div className="text-4xl font-black text-emerald-700">{formatCurrency(amount)}</div>
                        <p className="text-xs font-medium text-slate-600">
                          Klik tombol di bawah, lanjut ke halaman DOKU, lalu pilih <strong>GoPay</strong> sebagai metode pembayaran.
                        </p>
                      </div>

                      {paymentUrl ? (
                        <a
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-4 px-6 bg-[#00AED6] hover:bg-[#009bbf] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-[#00AED6]/25 text-center flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                        >
                          <Smartphone size={18} /> Bayar {formatCurrency(amount)} via GoPay <ChevronsRight size={18} />
                        </a>
                      ) : (
                        <div className="w-full py-4 text-center text-slate-400 text-xs font-bold bg-slate-100 rounded-2xl">
                          GoPay tidak tersedia untuk transaksi ini
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2.5 rounded-xl w-full justify-center">
                        <Clock size={13} className="text-emerald-600 animate-spin" />
                        <span>Sistem otomatis mendeteksi pembayaran setelah selesai</span>
                      </div>
                    </div>
                  )}

                  {/* ─── TAB: VA PERMATA ─── */}
                  {activeTab === "VA_PERMATA" && (
                    <div className="flex flex-col gap-4">
                      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <Building2 size={15} className="text-purple-600" /> Virtual Account {bankName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">DOKU SNAP</span>
                      </div>

                      {/* Nomor VA */}
                      <div className="bg-slate-50 border-2 border-purple-100 rounded-2xl p-5 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                          Nomor Virtual Account {bankName}
                        </span>
                        <div className="text-2xl sm:text-3xl font-mono font-black text-purple-700 tracking-widest">
                          {vaNumber || "—"}
                        </div>
                        <button
                          onClick={handleCopyVa}
                          className="mt-3 inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          {copiedVa ? <Check size={14} /> : <Copy size={14} />}
                          {copiedVa ? "Berhasil Disalin!" : `Salin No. VA ${bankName}`}
                        </button>
                      </div>

                      {howToPayPage && (
                        <a
                          href={howToPayPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Building2 size={13} /> 💡 Petunjuk Cara Transfer Resmi DOKU →
                        </a>
                      )}

                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2.5 rounded-xl w-full justify-center">
                        <Clock size={13} className="text-emerald-600 animate-spin" />
                        <span>Sistem otomatis mendeteksi pembayaran</span>
                      </div>

                      <div className="bg-purple-50/80 border border-purple-100 text-purple-900 p-4 rounded-2xl text-xs font-medium leading-relaxed space-y-1.5">
                        <p className="font-bold text-purple-950">💡 Cara Transfer via GoPay / m-Banking ke VA {bankName}:</p>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-800">
                          <li>Buka aplikasi <strong>GoPay / m-Banking</strong> Anda.</li>
                          <li>Pilih menu <strong>Transfer → ke Rekening Bank</strong>.</li>
                          <li>Pilih Bank Tujuan: <strong>BANK {bankName}</strong>.</li>
                          <li>Masukkan Nomor VA: <strong>{vaNumber}</strong>.</li>
                          <li>Masukkan nominal <strong>{formatCurrency(amount)}</strong> dan konfirmasi.</li>
                          <li>Nama penerima otomatis terverifikasi. Selesai! ✅</li>
                        </ol>
                      </div>
                    </div>
                  )}

                </Card>
              </div>

              {/* KANAN: Ringkasan Order (2/5) */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-md p-6">
                <h3 className="font-black text-slate-900 mb-4 pb-3 border-b border-slate-100 text-base">
                  Rincian Tagihan
                </h3>

                <div className="space-y-3 max-h-[28vh] overflow-y-auto pr-1 mb-4">
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-400 font-medium">{item.qty} Vote × {formatCurrency(item.price || 2000)}</p>
                      </div>
                      <p className="font-black text-emerald-600">{formatCurrency(item.qty * item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-150 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold">TOTAL VOTES</span>
                    <span className="font-black text-slate-800">{cart.reduce((s: number, i: any) => s + i.qty, 0)} Suara</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold">NOMOR INVOICE</span>
                    <span className="font-mono font-bold text-slate-700 text-[10px]">{invoiceId}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total Tagihan</span>
                    <span className="font-black text-emerald-600 text-xl">{formatCurrency(amount)}</span>
                  </div>
                </div>

                {/* Sandbox simulator button - bisa dihapus di production */}
                {import.meta.env.DEV && invoiceId && (
                  <button
                    onClick={handleSimulateWebhook}
                    disabled={simulating}
                    className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {simulating ? "Simulating..." : "🧪 [DEV] Simulate Payment"}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
