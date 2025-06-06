// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2, Package, PlusCircle, Archive, CheckCircle, TrendingUp, Users, FileCog, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

// --- INTERFACE DEFINITIONS ---
interface UserDashboardSummary {
  totalOrders: number;
  totalItems: number;
  ordersByStatus: {
    PENDING_PICKUP: number;
    PICKED_UP: number;
    STORED: number;
    PENDING_DELIVERY: number;
    DELIVERED: number;
  };
}

// PERUBAHAN: Interface baru untuk summary admin
interface AdminDashboardSummary {
    totalUsers: number;
    totalOrders: number;
    totalItems: number;
    // Tambahkan data lain yang relevan untuk admin
}


// ===================================================================
// PERUBAHAN: Komponen Dashboard untuk Pengguna Biasa (USER)
// (Ini adalah kode asli Anda yang dijadikan komponen terpisah)
// ===================================================================
const UserDashboard = ({ user }: { user: any }) => {
    const [summary, setSummary] = useState<UserDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        apiClient.getMyDashboardSummary()
            .then(response => {
                setSummary(response.data || response);
            })
            .catch(err => {
                console.error("Gagal memuat summary user dashboard:", err);
                setError('Gagal memuat data Anda.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="text-white space-y-6 sm:space-y-8">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-400 mb-2">
                    Selamat Datang, {user?.firstName || 'Pengguna'}!
                </h1>
                <p className="text-base sm:text-lg text-slate-300">
                    Kelola semua barang titipan Anda dengan mudah melalui Keepify.
                </p>
            </div>

            {error && <div className="bg-red-800/30 text-red-300 p-3 rounded-lg">{error}</div>}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-purple-400 mb-3"><TrendingUp size={24} className="mr-3"/><h3>Total Order</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.totalOrders ?? 0}</p>}
                </div>
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-sky-400 mb-3"><Archive size={24} className="mr-3"/><h3>Total Barang</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.totalItems ?? 0}</p>}
                </div>
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-green-400 mb-3"><CheckCircle size={24} className="mr-3"/><h3>Aman Tersimpan</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.ordersByStatus?.STORED ?? 0}</p>}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">Aksi Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Link href="/dashboard/my-items" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors group">
                        <div className="flex items-start space-x-4">
                            <Package size={28} className="text-sky-500 mt-1"/>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-1">Barang Saya</h3>
                                <p className="text-slate-400">Lihat dan kelola semua barang yang sedang Anda titipkan.</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/dashboard/new-item" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors group">
                        <div className="flex items-start space-x-4">
                            <PlusCircle size={28} className="text-green-500 mt-1"/>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-1">Titip Barang Baru</h3>
                                <p className="text-slate-400">Tambahkan barang baru untuk dititipkan dengan aman.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// PERUBAHAN: Komponen Dashboard baru khusus untuk ADMIN
// ===================================================================
const AdminDashboard = ({ user }: { user: any }) => {
    // Diasumsikan ada endpoint API baru untuk admin: getAdminDashboardSummary
    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Di dalam komponen AdminDashboard
    useEffect(() => {
        setIsLoading(true);
        setError(null); // Reset error state
        
        apiClient.getAdminDashboardSummary()
            .then(response => {
                // PERUBAHAN: Langsung gunakan 'response' karena sudah berisi data summary
                setSummary(response); 
            })
            .catch(err => {
                console.error("Gagal memuat summary admin dashboard:", err);
                setError('Gagal memuat data admin.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

     return (
        <div className="text-white space-y-6 sm:space-y-8">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-400 mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-base sm:text-lg text-slate-300">
                    Selamat datang, {user?.firstName}! Kelola sistem Keepify dari sini.
                </p>
            </div>

            {error && <div className="bg-red-800/30 text-red-300 p-3 rounded-lg">{error}</div>}

            {/* Admin Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-purple-400 mb-3"><Users size={24} className="mr-3"/><h3>Total Pengguna</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.totalUsers ?? 0}</p>}
                </div>
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-sky-400 mb-3"><FileCog size={24} className="mr-3"/><h3>Total Order</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.totalOrders ?? 0}</p>}
                </div>
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center text-green-400 mb-3"><Archive size={24} className="mr-3"/><h3>Total Barang Disimpan</h3></div>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <p className="text-4xl font-bold">{summary?.totalItems ?? 0}</p>}
                </div>
            </div>

            {/* Admin Quick Actions */}
             <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">Aksi Cepat Admin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Link href="/dashboard/manage-orders" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors group">
                        <div className="flex items-start space-x-4">
                            <FileCog size={28} className="text-sky-500 mt-1"/>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-1">Kelola Semua Order</h3>
                                <p className="text-slate-400">Lihat, cari, dan ubah status semua order dari pengguna.</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/dashboard/manage-users" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors group">
                        <div className="flex items-start space-x-4">
                            <Users size={28} className="text-green-500 mt-1"/>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-1">Kelola Pengguna</h3>
                                <p className="text-slate-400">Lihat daftar pengguna terdaftar dan kelola akun mereka.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// PERUBAHAN: Komponen Utama yang Menjadi "Router" Tampilan
// ===================================================================
export default function DashboardHomePage() {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login?message=Silakan login untuk mengakses dashboard');
    }
  }, [authIsLoading, isAuthenticated, router]);

  // Tampilkan loader saat otentikasi masih diproses
  if (authIsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 size={48} className="animate-spin text-sky-500" />
      </div>
    );
  }

  // Setelah loading selesai dan user terautentikasi, render dashboard yang sesuai
  if (isAuthenticated && user) {
      return user.role === 'admin' ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
  }

  // Fallback jika user tidak terautentikasi (seharusnya sudah di-redirect oleh useEffect)
  return null;
}