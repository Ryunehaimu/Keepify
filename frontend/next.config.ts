// --- TAMBAHKAN KODE INI DI BARIS PALING ATAS ---
// Deteksi jika ada localStorage 'zombie' yang rusak di server Node.js
if (typeof localStorage !== 'undefined') {
  try {
    // Jika localStorage ada TAPI getItem bukan function (berarti rusak/corrupt)
    if (typeof localStorage.getItem !== 'function') {
      console.warn('⚠️  MENDETEKSI LOCALSTORAGE RUSAK DARI LIBRARY PIHAK KETIGA. MENGHAPUSNYA...');
      // Hapus paksa dari memori global
      global.localStorage = undefined as any; 
      // Atau gunakan delete jika diizinkan: delete (global as any).localStorage;
    }
  } catch (e) {
    // Ignore error
  }
}
// -----------------------------------------------

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Pastikan ini true agar lebih aman
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Sesuaikan dengan port backend Anda
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;