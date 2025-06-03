// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Pastikan path ini benar
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Ikon untuk tombol toggle

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user, logoutAction } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default sidebar terbuka di desktop, tertutup di mobile (diatur via CSS)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Efek untuk mengunci scroll body saat sidebar mobile terbuka
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) { // md breakpoint Tailwind
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { // Cleanup function
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Memuat data pengguna...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarNavLinks = user?.role === 'admin' 
   ? [
        { name: 'Dashboard', href: '/dashboard', icon: null /* <LayoutDashboard size={20}/> */ },
        { name: 'Permintaan Pickup', href: '/dashboard/pickups', icon: null /* <Package size={20}/> */ },
        { name: 'Jadwal Monitoring', href: '/dashboard/monitoring', icon: null },
        { name: 'Manajemen User', href: '/dashboard/users', icon: null /* <Settings size={20}/> */ },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: null /* <LayoutDashboard size={20}/> */ },
        { name: 'Barang Saya', href: '/dashboard/my-items', icon: null /* <Package size={20}/> */ },
        { name: 'Titipkan Barang', href: '/dashboard/new-item', icon: null },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: null /* <Settings size={20}/> */ },
      ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-white relative md:static">
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col space-y-6
          bg-slate-800 p-5 border-r border-slate-700
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64 md:w-64' : 'w-64 md:w-0 md:p-0 md:border-none'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800
        `}
      >
        {/* Konten sidebar hanya ditampilkan jika sidebar terbuka atau di mode desktop dan terbuka */}
        <div className={`h-full flex flex-col ${(!isSidebarOpen && 'md:hidden')}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-sky-400">Keepify</h2>
            {/* Tombol close untuk mobile, terlihat jika sidebar terbuka */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 rounded-md text-slate-300 hover:bg-slate-700"
              aria-label="Tutup sidebar"
            >
              <X size={24} />
            </button>
          </div>
          {user && (
            <p className="text-sm text-slate-400 truncate mt-1">
              {user.firstName} ({user.role})
            </p>
          )}
          
          <nav className="flex-grow mt-6">
            <ul className="space-y-2">
              {sidebarNavLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-sky-500/10 hover:text-sky-300 transition-colors duration-150 ease-in-out"
                  >
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pt-4 mt-auto border-t border-slate-700">
            <button
              onClick={logoutAction}
              className="w-full flex items-center justify-center space-x-3 px-3 py-2.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white font-medium transition-colors duration-150 ease-in-out"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-x-hidden"> {/* Tambahkan flex-col dan overflow-x-hidden */}
        {/* Header untuk Main Content termasuk Tombol Toggle */}
        <header className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-md shadow-sm p-4 sm:p-5 flex items-center w-full">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            aria-label="Toggle sidebar"
          >
            {/* Ikon berubah tergantung state sidebar, atau selalu menu jika X ada di dalam sidebar */}
            <Menu size={24} /> 
          </button>
          <h1 className="ml-4 text-xl sm:text-2xl font-bold text-sky-400 truncate">
            Ringkasan {user?.role === 'admin' ? 'Admin' : 'Pengguna'}
          </h1>
        </header>

        {/* Konten Dashboard aktual */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kartu Statistik dan Bagan Placeholder */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-1">Total Barang Dititipkan</h3>
              <p className="text-3xl font-bold text-sky-400">15</p>
              <p className="text-xs text-slate-400 mt-1">+2 minggu ini</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-1">Monitoring Berikutnya</h3>
              <p className="text-3xl font-bold text-sky-400">3 Hari Lagi</p>
              <p className="text-xs text-slate-400 mt-1">Item "Dokumen Rahasia"</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Pertumbuhan Penitipan</h3>
              <div className="h-72 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">[Placeholder Bagan Pertumbuhan]</p>
              </div>
            </div>
            {/* Tambahkan lebih banyak kartu atau bagan di sini */}
          </div>
        </div>
      </main>
    </div>
  );
}