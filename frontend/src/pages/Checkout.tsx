import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useQrCodeStore } from "../stores/useQrCodeStore";
import { useTransactionStore } from "../stores/transactionStore";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalPrice, transactionCode } = location.state || { 
    cart: [], 
    totalPrice: 0, 
    transactionCode: ""
  };

  const { qrList, fetchQrCodes } = useQrCodeStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const activeQr = Array.isArray(qrList) ? qrList.find(q => q.status === "Aktif") : undefined;

  const handleConfirmTransfer = async () => {
    if (loading || success) return;
    setLoading(true);
    try {
      const result = await addTransaction(
        cart.map((i: any) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        transactionCode
      );

      if (!result) {
        alert("Gagal mendaftarkan tagihan. Pastikan koneksi backend berjalan.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/leaderboard");
      }, 5000);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  };

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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
          <p className="text-slate-500 font-bold mb-4">Keranjang kosong atau Anda mengakses halaman ini secara tidak sah.</p>
          <Button label="Kembali ke Catalog" variant="primary" onClick={() => navigate("/catalogvote")} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 pt-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors w-fit"
          disabled={loading || success}
        >
          <ArrowLeft size={20} /> Kembali ke Keranjang
        </button>

        {success ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-5 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Tagihan Terdaftar!</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Silakan segera lakukan pembayaran sebesar <strong className="text-emerald-600 font-extrabold">{formatCurrency(totalPrice)}</strong> dengan memindai kode QRIS yang tersedia.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 w-full text-left space-y-2">
              <p className="text-xs text-slate-500 font-semibold"><span className="text-slate-400">PENTING:</span> Admin akan mencocokkan nominal mutasi masuk di rekening bank/e-wallet secara manual sebelum menyetujui vote Anda.</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold animate-pulse mt-2">
              Mengalihkan Anda ke papan klasemen dalam beberapa detik...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Metode Pembayaran <span className="text-emerald-600">QRIS</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* KIRI: INSTRUKSI PEMBAYARAN */}
              <Card className="p-6 border-slate-200 flex flex-col items-center">
                <h3 className="font-black text-slate-950 text-base mb-4 border-b border-slate-100 pb-2 w-full text-left">
                  Scan QRIS Pembayaran
                </h3>
                
                {activeQr ? (
                  <div className="flex flex-col items-center text-center w-full">
                    <strong className="text-slate-800 text-sm font-extrabold mb-1">{activeQr.name}</strong>
                    <p className="text-[10px] text-slate-400 font-semibold mb-4 tracking-wider">{activeQr.description}</p>
                    <div className="bg-white p-3 border-2 border-slate-100 rounded-2xl shadow-inner mb-6 max-w-[240px] overflow-hidden">
                      <img 
                        src={activeQr.image} 
                        alt={activeQr.name} 
                        className="w-52 h-52 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-medium text-xs">
                    Tidak ada QR Code aktif yang dikonfigurasi oleh admin.
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200/80 text-amber-800 p-4 rounded-2xl text-[11px] font-medium leading-relaxed mb-6 w-full space-y-2">
                  <p>
                    ⚠️ <strong>PENTING:</strong> Pastikan Anda melakukan transfer nominal pembayaran secara tepat. Admin akan memverifikasi bukti transaksi masuk secara manual.
                  </p>
                  <p>
                    Sertakan kode transaksi berikut di catatan berita transfer (jika memungkinkan): <strong className="font-bold">{transactionCode}</strong>
                  </p>
                </div>

                <Button 
                  label={loading ? "Memproses..." : "SAYA SUDAH TRANSFER / BAYAR"} 
                  variant="primary" 
                  onClick={handleConfirmTransfer}
                  className="w-full py-4 text-xs font-bold tracking-wider shadow-lg shadow-emerald-100 uppercase"
                  disabled={loading}
                />
              </Card>

              {/* KANAN: RINGKASAN ORDER */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
                  <h3 className="font-black text-slate-900 mb-4 pb-3 border-b border-slate-100 text-lg">
                    Rincian Pembelian
                  </h3>
                  
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1 mb-4">
                    {cart.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-slate-500 font-medium text-xs">{item.qty} Vote x {formatCurrency(item.price)}</p>
                        </div>
                        <p className="font-black text-emerald-600">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-150 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">TOTAL SUARA</span>
                      <span className="font-black text-slate-800">{cart.reduce((sum: number, i: any) => sum + i.qty, 0)} Vote</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-650">Total Pembayaran</span>
                      <span className="font-black text-emerald-600 text-xl">{formatCurrency(totalPrice)}</span>
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
