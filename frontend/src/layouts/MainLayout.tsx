import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header */}
      <Header />

      {/* Main Content 
          Dihilangkan max-w, px, dan py agar halaman seperti Beranda 
          bisa merentang full-width (edge-to-edge) di bagian Hero-nya. 
      */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}