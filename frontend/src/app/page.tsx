// src/app/page.tsx atau src/app/landing/page.tsx
import Link from 'next/link';
import { ShieldCheck, Smartphone, Edit3 } from 'lucide-react'; // Contoh ikon dari lucide-react [cite: 42]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header / Navigasi */}
      <header className="p-4 sm:p-6">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-400">Keepify</h1>
          <div className="space-x-2 sm:space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm sm:text-base font-medium text-sky-400 border border-sky-400 rounded-lg hover:bg-sky-400 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm sm:text-base font-medium bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Titipkan Barang Berharga Anda, <br />
          <span className="text-sky-400">Aman dan Terpantau.</span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Keepify hadir sebagai solusi penitipan barang modern dengan sistem monitoring berkala,
          formulir digital lengkap, dan keamanan terjamin untuk ketenangan pikiran Anda.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 text-lg font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-lg hover:shadow-sky-500/50"
        >
          Mulai Titipkan Barang
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">
            Mengapa Memilih Keepify?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="p-6 bg-slate-700/40 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
              <div className="flex justify-center mb-4">
                <ShieldCheck size={48} className="text-sky-400" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2">Keamanan Terjamin</h4>
              <p className="text-slate-300 text-sm sm:text-base">
                Barang Anda disimpan dengan aman dan dilengkapi dengan sistem checklist saat pengambilan dan pengembalian. [cite: 1]
              </p>
            </div>
            <div className="p-6 bg-slate-700/40 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
              <div className="flex justify-center mb-4">
                <Smartphone size={48} className="text-sky-400" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2">Monitoring Mudah</h4>
              <p className="text-slate-300 text-sm sm:text-base">
                Pantau kondisi barang Anda secara berkala dengan laporan foto langsung dari aplikasi. [cite: 1]
              </p>
            </div>
            <div className="p-6 bg-slate-700/40 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
              <div className="flex justify-center mb-4">
                <Edit3 size={48} className="text-sky-400" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2">Proses Digital</h4>
              <p className="text-slate-300 text-sm sm:text-base">
                Mulai dari formulir penitipan hingga tanda tangan perjanjian, semua dilakukan secara digital. [cite: 1]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Siap untuk Merasakan Ketenangan?
          </h3>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Bergabunglah dengan Keepify sekarang dan nikmati layanan penitipan barang yang aman, transparan, dan modern.
          </p>
          <Link
            href="/register"
            className="px-8 py-3 text-lg font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-lg hover:shadow-sky-500/50"
          >
            Daftar Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Keepify. Semua Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}