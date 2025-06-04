// src/app/page.tsx atau src/app/landing/page.tsx
import Link from "next/link";
import { ShieldCheck, Smartphone, Edit3 } from "lucide-react"; // Contoh ikon dari lucide-react [cite: 42]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-main">
      {/* Header / Navigasi */}
      <header className="sticky top-0 z-50 backdrop-blur-md backdrop-brightness-100 bg-transparent text-white p-4 sm:p-6">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-400">
            Keepify
          </h1>
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

      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-[75vh] text-center">
        {/* Subtle light rays */}
        <div className="absolute top-0 right-1/4 w-px h-96 bg-gradient-to-b from-slate-600/30 to-transparent rotate-12"></div>
        <div className="absolute top-32 left-1/3 w-px h-64 bg-gradient-to-b from-slate-500/20 to-transparent -rotate-12"></div>

        {/* Launch Badge */}
        <div className="mb-8">
          <span className="px-4 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-full text-slate-300 text-sm">
            Keepify 2.2 Launched At 21st June 2025
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
          Titipkan Barang Berharga Anda,
          <br />
          <span className="text-sky-400">Aman dan Terpantau.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Keepify memudahkan Anda menitip barang secara digital, aman, dan bisa
          dipantau kapan saja.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
            Mulai Titipkan Barang
          </button>
        </div>
      </main>

      {/* About */}
      <section className="py-20 ">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-[900px]">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                <span className="text-sky-400 text-sm font-medium">
                  Apa itu Keepify ?
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-8">
                Keepify adalah solusi penitipan cerdas yang dirancang untuk
                kebutuhan penyimpanan modern, dilengkapi pemantauan visual dan
                respons adaptif yang dipersonalisasi dengan kepercayaan tinggi.
              </h2>
            </div>

            {/* Right Content */}
            <div className="flex items-end text-right justify-end flex-col ">
              <div className="mb-8">
                <p className="text-gray-300 text-lg leading-relaxed max-w-[500px]">
                  Keepify menawarkan pengalaman penitipan barang berharga yang
                  efisien, aman, dan dapat Anda pantau kapan saja.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="text-right">
                <button className="px-8 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
                  Mulai Titipkan Barang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b ">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
              <span className="text-sky-400 text-sm font-medium">
                Kenapa Harus Keepify ?
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Pemantauan Visual, Proses Digital, <br />
              Keamanan Adaptif
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-sky-400/10 rounded-xl flex items-center justify-center border border-sky-400/20">
                  <ShieldCheck size={32} className="text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Keamanan Terjamin
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Barang Anda disimpan dengan aman dan dilengkapi dengan sistem
                checklist saat pengambilan dan pengembalian.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-sky-400/10 rounded-xl flex items-center justify-center border border-sky-400/20">
                  <Smartphone size={32} className="text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Montoring Mudah
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pantau kondisi barang Anda secara berkala dengan laporan foto
                langsung dari aplikasi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-sky-400/10 rounded-xl flex items-center justify-center border border-sky-400/20">
                  <Edit3 size={32} className="text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Proses Digital
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mulai dari formulir penitipan hingga tanda tangan perjanjian,
                semua dilakukan secara digital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center border border-transparent *:rounded-2xl overflow-hidden relative">
          {/* Background image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/images/light-trail.jpg')`, // Ganti dengan path gambar kamu
            }}
          ></div>

          {/* Overlay semi-gelap agar teks lebih terbaca */}
          <div className="absolute inset-0 bg-slate-900/50 z-10"></div>

          {/* Content */}
          <div className="relative z-20 py-20 sm:py-32 px-4">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6">
              Siap untuk Merasakan Ketenangan?
            </h3>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl mx-auto">
              Bergabunglah dengan Keepify sekarang dan nikmati layanan penitipan
              barang yang aman, transparan, dan modern.
            </p>
            <div className="flex flex-col justify-center sm:flex-row gap-4">
              <button className="px-8 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
                Mulai Titipkan Barang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" text-white relative overflow-hidden">
        {/* Navigation Links */}
        <div className="relative z-10 pt-8 px-4">
          <div className="container mx-auto px-4 text-center text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} Keepify. Semua Hak Cipta
              Dilindungi.
            </p>
          </div>
        </div>

        {/* Large Brand Text - Cut off left, right, bottom */}
        <div className="relative h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] overflow-hidden">
          <div className="text-[130px] sm:text-[200px] md:text-[250px] lg:text-[280px] xl:text-[300px] font-black leading-none text-white/15 text-center select-none absolute top-0 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            Keepify
          </div>

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </footer>
    </div>
  );
}
