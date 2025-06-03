// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2, Package, PlusCircle, Archive, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

// Enhanced interface for dashboard summary
interface DashboardSummary {
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

export default function DashboardHomePage() {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login?message=Silakan login untuk mengakses dashboard');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingSummary(true);
      setError(null);
      
      apiClient.getMyDashboardSummary()
        .then(response => {
          // Handle both direct data and wrapped response
          const data = response.data || response;
          setSummary(data);
        })
        .catch(err => {
          console.error("Gagal memuat summary dashboard:", err);
          setError('Gagal memuat data dashboard');
        })
        .finally(() => {
          setIsLoadingSummary(false);
        });
    }
  }, [isAuthenticated]);

  if (authIsLoading || (!isAuthenticated && !authIsLoading && typeof window !== 'undefined')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 size={48} className="animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="text-white space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-400 mb-2">
          Selamat Datang, {user?.firstName || 'Pengguna'}!
        </h1>
        <p className="text-base sm:text-lg text-slate-300">
          Kelola semua barang titipan Anda dengan mudah melalui Keepify.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-800/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-red-200 underline text-sm mt-1"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
          <div className="flex items-center text-purple-400 mb-3">
            <TrendingUp size={24} className="mr-3 flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-semibold">Total Order</h3>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center">
              <Loader2 size={20} className="animate-spin text-slate-400 mr-2" />
              <span className="text-slate-400 text-sm">Loading...</span>
            </div>
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {summary?.totalOrders ?? 0}
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jumlah order penitipan Anda.
          </p>
        </div>

        {/* Total Items */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
          <div className="flex items-center text-sky-400 mb-3">
            <Archive size={24} className="mr-3 flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-semibold">Total Barang</h3>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center">
              <Loader2 size={20} className="animate-spin text-slate-400 mr-2" />
              <span className="text-slate-400 text-sm">Loading...</span>
            </div>
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {summary?.totalItems ?? 0}
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jumlah semua barang Anda.
          </p>
        </div>

        {/* Stored Items */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow">
          <div className="flex items-center text-green-400 mb-3">
            <CheckCircle size={24} className="mr-3 flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-semibold">Aman Tersimpan</h3>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center">
              <Loader2 size={20} className="animate-spin text-slate-400 mr-2" />
              <span className="text-slate-400 text-sm">Loading...</span>
            </div>
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {summary?.ordersByStatus?.STORED ?? 0}
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Order dengan status "STORED".
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">
          Aksi Cepat
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Link 
            href="/dashboard/my-items" 
            className="block p-4 sm:p-6 bg-slate-800 rounded-xl shadow-lg hover:bg-slate-700/70 transition-colors group"
          >
            <div className="flex items-start space-x-4">
              <Package 
                size={28} 
                className="text-sky-500 group-hover:scale-110 transition-transform flex-shrink-0 mt-1" 
              />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-sky-400 group-hover:text-sky-300 mb-1">
                  Barang Saya
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Lihat dan kelola semua barang yang sedang Anda titipkan.
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/new-item" 
            className="block p-4 sm:p-6 bg-slate-800 rounded-xl shadow-lg hover:bg-slate-700/70 transition-colors group"
          >
            <div className="flex items-start space-x-4">
              <PlusCircle 
                size={28} 
                className="text-green-500 group-hover:scale-110 transition-transform flex-shrink-0 mt-1" 
              />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-green-400 group-hover:text-green-300 mb-1">
                  Titip Barang Baru
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Tambahkan barang baru untuk dititipkan dengan aman.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Status Overview (if data available) */}
      {summary?.ordersByStatus && !isLoadingSummary && (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-4">
            Status Order
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-500">Pending Pickup</p>
              <p className="text-lg sm:text-xl font-bold text-yellow-400">
                {summary.ordersByStatus.PENDING_PICKUP}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-500">Picked Up</p>
              <p className="text-lg sm:text-xl font-bold text-blue-400">
                {summary.ordersByStatus.PICKED_UP}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-500">Stored</p>
              <p className="text-lg sm:text-xl font-bold text-green-400">
                {summary.ordersByStatus.STORED}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-500">Pending Delivery</p>
              <p className="text-lg sm:text-xl font-bold text-orange-400">
                {summary.ordersByStatus.PENDING_DELIVERY}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-500">Delivered</p>
              <p className="text-lg sm:text-xl font-bold text-slate-400">
                {summary.ordersByStatus.DELIVERED}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}