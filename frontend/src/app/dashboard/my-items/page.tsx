'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Package, PlusCircle, AlertTriangle, Loader2, MapPin, Clock, Phone, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Updated interface for entrustment orders
interface EntrustedItem {
  id: number;
  name: string;
  description: string;
  category: string;
  estimatedValue?: string;
  itemCondition: string;
  quantity: number;
  brand?: string;
  model?: string;
  color?: string;
  specialInstructions?: string;
}

interface EntrustmentOrder {
  id: number;
  allowChecks: boolean;
  monitoringFrequency: string;
  pickupRequestedDate: string;
  pickupAddress: string;
  contactPhone: string;
  expectedRetrievalDate?: string;
  status: string; // PENDING_PICKUP, STORED, PENDING_DELIVERY, DELIVERED, etc.
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
  entrustedItems: EntrustedItem[];
  // Add other fields as needed
}

export default function MyItemsPage() {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const [orders, setOrders] = useState<EntrustmentOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login?message=Silakan login untuk melihat barang Anda');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        setError(null);
        try {
          const response = await apiClient.getMyItems();
          console.log('Fetched orders:', response);
          setOrders(response.data || response);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Gagal memuat daftar penitipan.');
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (authIsLoading || (!isAuthenticated && !authIsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 size={48} className="animate-spin text-sky-500" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'PICKED_UP': return 'text-blue-400 bg-blue-900/50 border-blue-700';
      case 'STORED': return 'text-green-400 bg-green-900/50 border-green-700';
      case 'PENDING_DELIVERY': return 'text-orange-400 bg-orange-900/50 border-orange-700';
      case 'DELIVERED': return 'text-slate-400 bg-slate-700/50 border-slate-600';
      case 'CANCELLED': return 'text-red-400 bg-red-900/50 border-red-700';
      default: return 'text-gray-400 bg-gray-700/50 border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'Menunggu Penjemputan';
      case 'PICKED_UP': return 'Sudah Dijemput';
      case 'STORED': return 'Disimpan';
      case 'PENDING_DELIVERY': return 'Menunggu Pengiriman';
      case 'DELIVERED': return 'Sudah Dikirim';
      case 'CANCELLED': return 'Dibatalkan';
      default: return status?.replace(/_/g, ' ') || 'Tidak Diketahui';
    }
  };

  const getMonitoringFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'none': return 'Tidak ada monitoring';
      case 'weekly_once': return '1x seminggu';
      case 'weekly_twice': return '2x seminggu';
      default: return frequency;
    }
  };

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  };

  const getTotalItems = (order: EntrustmentOrder) => {
    return order.entrustedItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-sky-500">Order Penitipan Saya</h1>
            <p className="text-slate-400 mt-1">Lihat dan kelola semua order penitipan yang telah Anda buat.</p>
          </div>
          <Link 
            href="/dashboard/new-item"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Buat Order Baru
          </Link>
        </div>

        {isLoadingOrders && (
          <div className="flex justify-center items-center py-10">
            <Loader2 size={32} className="animate-spin text-sky-500" />
            <p className="ml-3 text-slate-300">Memuat daftar order...</p>
          </div>
        )}

        {error && !isLoadingOrders && (
          <div className="bg-red-800/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg flex items-center">
            <AlertTriangle size={24} className="mr-3 text-red-400" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoadingOrders && !error && orders.length === 0 && (
          <div className="text-center py-10 bg-slate-800/50 rounded-lg">
            <Package size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-xl text-slate-400">Anda belum membuat order penitipan.</p>
            <p className="text-slate-500 mt-1">Mulai titipkan barang berharga Anda sekarang.</p>
          </div>
        )}

        {!isLoadingOrders && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-sky-500/20 transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                  {/* Image Section */}
                  <div className="lg:w-64 h-48 lg:h-auto relative bg-slate-700 flex-shrink-0">
                    {order.imagePath ? (
                      <Image
                        src={`${getApiBaseUrl()}/${order.imagePath.replace(/\\/g, '/')}`}
                        alt={`Order #${order.id}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-sky-400 mb-2">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-right text-sm text-slate-400 mt-2 sm:mt-0">
                        <p>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</p>
                      </div>
                    </div>

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <Package size={16} className="mr-2 text-sky-400" />
                        <span>{getTotalItems(order)} barang ({order.entrustedItems.length} jenis)</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-300">
                        <Clock size={16} className="mr-2 text-purple-400" />
                        <span>{getMonitoringFrequencyText(order.monitoringFrequency)}</span>
                      </div>

                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar size={16} className="mr-2 text-emerald-400" />
                        <span>Penjemputan: {new Date(order.pickupRequestedDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>

                      <div className="flex items-center text-sm text-slate-300">
                        <Phone size={16} className="mr-2 text-orange-400" />
                        <span>{order.contactPhone}</span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Barang yang dititipkan:</h4>
                      <div className="space-y-1">
                        {order.entrustedItems.slice(0, 3).map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{item.name}</span>
                            <span className="text-slate-500">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.entrustedItems.length > 3 && (
                          <p className="text-xs text-slate-500">
                            ... dan {order.entrustedItems.length - 3} barang lainnya
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pickup Address */}
                    <div className="mb-4">
                      <div className="flex items-start text-sm text-slate-300">
                        <MapPin size={16} className="mr-2 mt-0.5 text-emerald-400 flex-shrink-0" />
                        <span className="line-clamp-2">{order.pickupAddress}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <Link 
                        href={`/dashboard/my-items/${order.id}`}
                        className="px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}