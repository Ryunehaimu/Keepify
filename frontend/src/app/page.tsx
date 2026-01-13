// src/app/page.tsx atau src/app/landing/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import warehouseImage from "@/../public/assets/images/hero.webp";
import deliveryImage from "@/../public/assets/images/delivery.webp";
import placementImage from "@/../public/assets/images/penataan.webp";
import teamImage from "@/../public/assets/images/team.webp";
import navLogo from "@/../public/assets/images/navlogo.svg";
import React, { useState } from "react";
import { UserPlus, FileText, Truck } from "lucide-react";
import { ShieldCheck, Smartphone, Edit3 } from "lucide-react"; // Contoh ikon dari lucide-react [cite: 42]
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      icon: UserPlus,
      title: "Buat Akun",
      description: "Daftar dengan mudah dan cepat",
      content: {
        heading: "Mulai Dengan Mudah",
        details:
          "Buat akun Keepify Anda hanya dalam beberapa menit. Cukup isi informasi dasar seperti nama, email, dan nomor telepon. Akun Anda akan langsung aktif dan siap digunakan.",
        features: [
          "Pendaftaran cepat dalam 2 menit",
          "Verifikasi email otomatis",
          "Dashboard pribadi untuk kelola titipan",
        ],
      },
    },
    {
      id: 1,
      icon: FileText,
      title: "Buat Pesanan",
      description: "Isi formulir penitipan barang",
      content: {
        heading: "Lengkapi Formulir Digital",
        details:
          "Isi formulir penitipan secara online dengan detail barang yang akan dititipkan. Upload foto barang, pilih durasi penyimpanan, dan tentukan jadwal penjemputan yang sesuai dengan waktu Anda.",
        features: [
          "Formulir digital yang mudah diisi",
          "Upload foto dokumentasi barang",
          "Pilih paket dan durasi sesuai kebutuhan",
        ],
      },
    },
    {
      id: 2,
      icon: Truck,
      title: "Tunggu Penjemputan",
      description: "Tim kami akan menjemput barang",
      content: {
        heading: "Kami Jemput Barang Anda",
        details:
          "Setelah pesanan dikonfirmasi, tim Keepify akan datang ke lokasi Anda sesuai jadwal yang telah ditentukan. Barang akan diperiksa, difoto, dan ditandatangani secara digital sebelum dibawa ke gudang penyimpanan yang aman.",
        features: [
          "Penjemputan tepat waktu",
          "Checklist kondisi barang lengkap",
          "Tanda tangan digital perjanjian",
        ],
      },
    },
  ];

  const facilities = [
    {
      id: 1,
      label: "AREA PENYIMPANAN",
      title: "Area Penyimpanan Aman",
      description: "Dirancang untuk menjaga barang tetap aman dan tertata",
      image: warehouseImage,
      color: "sky",
      gradient: "from-sky-500/10 to-purple-500/10",
    },
    {
      id: 2,
      label: "LAYANAN PICKUP",
      title: "Penjemputan Barang",
      description: "Membantu proses pengiriman barang dengan lebih mudah",
      image: deliveryImage,
      color: "sky",
      gradient: "from-sky-500/10 to-purple-500/10",
    },
    {
      id: 3,
      label: "PENATAAN",
      title: "Penataan Barang Rapi",
      description: "Barang disusun dengan rapi agar mudah ditemukan",
      image: placementImage,
      color: "sky",
      gradient: "from-sky-500/10 to-purple-500/10",
    },
    {
      id: 4,
      label: "TIM KAMI",
      title: "Tim yang Berdedikasi",
      description: "Bekerja dengan teliti dan penuh tanggung jawab",
      image: teamImage,
      color: "sky",
      gradient: "from-sky-500/10 to-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-main">
      {/* Header / Navigasi */}
      <header
        className="
  sticky top-0 left-0 w-full z-50
  backdrop-blur-md bg-transparent 
  text-white
"
      >
        <nav className="container mx-auto flex justify-between items-center p-4 sm:p-6">
          <div className="flex">
            <Image
              src={navLogo}
              alt="nav logo"
              width={100}
              height={100}
              className=""
            />

          </div>
          <div className="space-x-2 sm:space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm sm:text-base font-medium
                   text-sky-400 border border-sky-400 rounded-lg
                   hover:bg-sky-400 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm sm:text-base font-medium
                   bg-sky-500 text-white rounded-lg
                   hover:bg-sky-600 transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative h-[700px] flex items-center justify-center text-center px-6">
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

        {/* GLOW */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-full md:w-[900px] h-[350px] bg-sky-500/20 blur-[140px]" />

        {/* CONTENT */}
        {/* CONTENT */}
        <ScrollAnimationWrapper className="relative z-10 max-w-5xl mx-auto" preset="fade-up">
          <p className="text-sm text-slate-400 mb-4">
            Secure • Digital • Always Monitored
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Titipkan Barang Berharga Anda Secara Online
            <br />
            <span className="text-sky-400">Aman dan Terpantau.</span>
          </h1>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto">
            Keepify menghadirkan layanan penitipan barang digital yang aman,
            praktis, dan dapat dipantau kapan saja, di mana saja.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-semibold"
            >
              Mulai Sekarang
            </Link>
          </div>
        </ScrollAnimationWrapper>
      </section>

      {/* About */}
      <section className="py-20 ">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            {/* Left Content */}
            <ScrollAnimationWrapper className="max-w-[900px]" preset="fade-right">
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
            </ScrollAnimationWrapper>

            {/* Right Content */}
            <ScrollAnimationWrapper className="flex items-end text-right justify-end flex-col" preset="fade-left" delay={0.2}>
              <div className="mb-8">
                <p className="text-gray-300 text-lg leading-relaxed max-w-[500px]">
                  Keepify menawarkan pengalaman penitipan barang berharga yang
                  efisien, aman, dan dapat Anda pantau kapan saja.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="text-right">
                <Link
                  href="/register"
                  className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-lg  transition-all duration-300 backdrop-blur-sm"
                >
                  Mulai Titipkan Barang
                </Link>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
              <span className="text-sky-400 text-sm font-medium">
                Komitmen Layanan Aman dari Keepify
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Fasilitas Aman & Tim Berdedikasi <br />
              untuk Penyimpanan yang Terjaga
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Kami menghadirkan layanan penyimpanan yang aman, rapi, dan
              dikelola dengan penuh tanggung jawab sejak hari pertama.
            </p>
          </div>

          {/* Gallery Grid - Featured Work Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map((item, index) => (
              <ScrollAnimationWrapper
                key={item.id}
                preset="fade-up"
                delay={index * 0.1}
                className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
              >
                {/* Gradient hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} 
        group-hover:opacity-0 transition-opacity duration-300 z-10`}
                />

                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 bg-${item.color}-400 rounded-full animate-pulse`}
                    />
                    <span
                      className={`text-${item.color}-400 text-xs font-medium`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <h3 className="text-white text-xl font-bold mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b ">
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
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
            <ScrollAnimationWrapper className="text-center" preset="fade-up" delay={0.1}>
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
            </ScrollAnimationWrapper>

            {/* Feature 2 */}
            <ScrollAnimationWrapper className="text-center" preset="fade-up" delay={0.2}>
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
            </ScrollAnimationWrapper>

            {/* Feature 3 */}
            <ScrollAnimationWrapper className="text-center" preset="fade-up" delay={0.3}>
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
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      <section className="py-20 ">
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
              <span className="text-sky-400 text-sm font-medium">
                Cara Kerja Keepify
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              3 Langkah Mudah <br />
              Menitipkan Barang Anda
            </h2>
          </div>

          {/* Stackable Tabs */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Step Selector */}
            <ScrollAnimationWrapper className="space-y-4" preset="fade-right">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${isActive
                      ? "bg-sky-400/10 border-sky-400/50 shadow-lg shadow-sky-400/20"
                      : "bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number & Icon */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                          ? "bg-sky-400/20 border-2 border-sky-400"
                          : "bg-gray-700/50 border-2 border-gray-600"
                          }`}
                      >
                        <Icon
                          size={24}
                          className={
                            isActive ? "text-sky-400" : "text-gray-400"
                          }
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium ${isActive ? "text-sky-400" : "text-gray-500"
                              }`}
                          >
                            Langkah {index + 1}
                          </span>
                        </div>
                        <h3
                          className={`text-xl font-semibold mb-1 transition-colors ${isActive ? "text-white" : "text-gray-300"
                            }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors ${isActive ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollAnimationWrapper>

            {/* Right: Step Content */}
            <ScrollAnimationWrapper className="lg:sticky lg:top-8" preset="fade-left">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {activeStep + 1}
                    </span>
                  </div>
                  <span className="text-sky-400 text-sm font-medium">
                    Langkah {activeStep + 1} dari 3
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {steps[activeStep].content.heading}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {steps[activeStep].content.details}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {steps[activeStep].content.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-sky-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="text-center border border-transparent rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0">
              {/* Glow kiri atas */}
              <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-500/30 rounded-full blur-[140px]" />

              {/* Glow kanan */}
              <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-sky-500/30 rounded-full blur-[140px]" />

              {/* Glow bawah */}
              <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[140px]" />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/50 z-10"></div>

            {/* Content */}
            <ScrollAnimationWrapper className="relative z-20 py-20 sm:py-32 px-4" preset="zoom-in">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">
                Terhubung dengan Keepify
              </h3>

              <p className="text-gray-400 text-lg max-w-2xl mb-10 mx-auto">
                Ikuti perjalanan Keepify dan hubungi kami untuk mendapatkan
                informasi terbaru seputar layanan penyimpanan barang yang aman
                dan terpercaya.
              </p>

              <div className="flex flex-row justify-center gap-4">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/keepify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Keepify"
                  className="flex items-center gap-2 px-3 py-3 border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-xl hover:bg-slate-800/50 transition"
                >
                  <Image
                    src="/assets/icons/instagram.svg"
                    alt="Instagram Keepify"
                    width={32}
                    height={32}
                  />
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@keepify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tiktok Keepify"
                  className="flex items-center gap-2 px-3 py-3 border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-xl hover:bg-slate-800/50 transition"
                >
                  <Image
                    src="/assets/icons/tiktok.svg"
                    alt="Tiktok Keepify"
                    width={32}
                    height={32}
                  />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/6281392800526"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Whatsapp Keepify"
                  className="flex items-center gap-2 px-3 py-3 border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-xl hover:bg-slate-800/50 transition"
                >
                  <Image
                    src="/assets/icons/whatsapp.svg"
                    alt="Whatsapp Keepify"
                    width={32}
                    height={32}
                  />
                </a>
              </div>
            </ScrollAnimationWrapper>
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
