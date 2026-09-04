import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthStore } from "../stores/useAuthStore";
import Button from "../components/ui/Button";

const schema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const login = useAuthStore((state) => state.login);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email: data.email, password: data.password }
      );
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      login(user?.name || data.email.split("@")[0]);
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Email atau password salah.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      
      <button
        onClick={() => navigate("/beranda")}
        className="self-start flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-6 transition-colors text-sm cursor-pointer"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="w-full bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-slate-500 text-xs mt-1">Masukkan kredensial akses Anda.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                {...register("email")}
                placeholder="Email Admin"
                defaultValue="admin@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-sm font-medium transition-all"
              />
            </div>
            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message as string}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register("password")}
                placeholder="Password"
                defaultValue="12345678"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-sm font-medium transition-all"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.password.message as string}</p>}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-6 rounded-xl font-bold text-sm cursor-pointer"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}