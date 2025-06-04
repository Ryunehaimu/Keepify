'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { 
  ArrowLeft, 
  Package, 
  CalendarDays, 
  Tag, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Edit3, 
  AlertTriangle, 
  Loader2,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Palette,
  Settings
} from 'lucide-react';

// Updated interfaces for entrustment orders
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
  status: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
  entrustedItems: EntrustedItem[];
  ownerId: number;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const [order, setOrder] = useState<EntrustmentOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login?message=Silakan login untuk melihat detail order');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && orderId) {
      const fetchOrderDetail = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Fetching order with ID:", orderId, "Type:", typeof orderId);
        try {
          const response = await apiClient.getStorageItem(Number(orderId));
          console.log("Fetched order detail:", response);
          setOrder(response.data || response);
        } catch (err: any) {
          console.error("Failed to fetch order detail:", err);
          if (err.response?.status === 404 || err.response?.status === 403) {
            setError(`Order tidak ditemukan atau Anda tidak memiliki akses.`);
          } else {
            setError(err.response?.data?.message || err.message || 'Gagal memuat detail order.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderDetail();
    } else if (!orderId && !authIsLoading && isAuthenticated) {
      setError("ID order tidak valid.");
      setIsLoading(false);
    }
  }, [isAuthenticated, orderId]);

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': 
        return { 
          text: 'Menunggu Penjemputan', 
          color: 'text-yellow-400 border-yellow-700 bg-yellow-900/60', 
          icon: <Loader2 className="inline mr-2 h-5 w-5 animate-spin" /> 
        };
      case 'PICKED_UP': 
        return { 
          text: 'Sudah Dijemput', 
          color: 'text-blue-400 border-blue-700 bg-blue-900/60', 
          icon: <CheckCircle className="inline mr-2 h-5 w-5" /> 
        };
      case 'STORED': 
        return { 
          text: 'Disimpan Aman', 
          color: 'text-green-400 border-green-700 bg-green-900/60', 
          icon: <ShieldCheck className="inline mr-2 h-5 w-5" /> 
        };
      case 'PENDING_DELIVERY': 
        return { 
          text: 'Menunggu Pengiriman', 
          color: 'text-orange-400 border-orange-700 bg-orange-900/60', 
          icon: <Loader2 className="inline mr-2 h-5 w-5 animate-spin" /> 
        };
      case 'DELIVERED': 
        return { 
          text: 'Sudah Dikirim', 
          color: 'text-slate-400 border-slate-600 bg-slate-700/60', 
          icon: <Package className="inline mr-2 h-5 w-5" /> 
        };
      case 'CANCELLED': 
        return { 
          text: 'Dibatalkan', 
          color: 'text-red-400 border-red-600 bg-red-900/60', 
          icon: <XCircle className="inline mr-2 h-5 w-5" /> 
        };
      default: 
        return { 
          text: status?.replace(/_/g, ' ') || 'Tidak Diketahui', 
          color: 'text-gray-400 border-gray-600 bg-gray-800/60', 
          icon: <Package className="inline mr-2 h-5 w-5" /> 
        };
    }
  };

  const getMonitoringFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'none': return 'Tidak ada monitoring';
      case 'weekly_once': return '1 kali seminggu';
      case 'weekly_twice': return '2 kali seminggu';
      default: return frequency;
    }
  };

  const getTotalItems = (order: EntrustmentOrder) => {
    return order.entrustedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalEstimatedValue = (order: EntrustmentOrder) => {
    return order.entrustedItems.reduce((total, item) => {
      const value = item.estimatedValue ? parseFloat(item.estimatedValue) : 0;
      return total + (value * item.quantity);
    }, 0);
  };

  if (authIsLoading || (isLoading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 size={48} className="animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-400 mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-300 mb-6 text-center">{error}</p>
        <Link href="/dashboard/my-items" className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-medium">
          Kembali ke Daftar Order
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Package size={48} className="text-slate-500 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-400 mb-2">Order Tidak Ditemukan</h2>
        <p className="text-slate-300 mb-6 text-center">Detail untuk order ini tidak dapat ditemukan.</p>
        <Link href="/dashboard/my-items" className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-medium">
          Kembali ke Daftar Order
        </Link>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(order.status);
  const totalValue = getTotalEstimatedValue(order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        <Link href="/dashboard/my-items" className="inline-flex items-center text-sky-400 hover:text-sky-300 mb-6 group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Order
        </Link>

        {/* Header Section */}
        <div className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden mb-6">
          {order.imagePath && (
            <div className="w-full h-64 md:h-80 relative">
              <Image
                src={`${getApiBaseUrl()}/${order.imagePath.replace(/\\/g, '/')}`}
                alt={`Order #${order.id}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-sky-400 mb-2">
                  Order Penitipan #{order.id}
                </h1>
                <p className="text-slate-400">
                  {getTotalItems(order)} barang ({order.entrustedItems.length} jenis)
                </p>
              </div>
            </div>

            <div className={`inline-flex items-center px-4 py-2 text-base font-semibold rounded-lg border mb-6 ${statusInfo.color}`}>
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>

            {/* Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start">
                <CalendarDays size={20} className="text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-slate-500 font-medium">Tanggal Penjemputan</h3>
                  <p className="text-base text-slate-300">
                    {new Date(order.pickupRequestedDate).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone size={20} className="text-orange-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-slate-500 font-medium">Nomor Telepon</h3>
                  <p className="text-base text-slate-300">{order.contactPhone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock size={20} className="text-purple-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-slate-500 font-medium">Monitoring</h3>
                  <p className="text-base text-slate-300">
                    {order.allowChecks ? getMonitoringFrequencyText(order.monitoringFrequency) : 'Tidak diizinkan'}
                  </p>
                </div>
              </div>

              {order.expectedRetrievalDate && (
                <div className="flex items-start">
                  <CalendarDays size={20} className="text-sky-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm text-slate-500 font-medium">Perkiraan Pengambilan</h3>
                    <p className="text-base text-slate-300">
                      {new Date(order.expectedRetrievalDate).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {totalValue > 0 && (
                <div className="flex items-start">
                  <DollarSign size={20} className="text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm text-slate-500 font-medium">Total Estimasi Nilai</h3>
                    <p className="text-base text-slate-300">Rp {totalValue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <CalendarDays size={20} className="text-slate-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-slate-500 font-medium">Dibuat Pada</h3>
                  <p className="text-base text-slate-300">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="mb-8">
              <div className="flex items-start">
                <MapPin size={20} className="text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-slate-500 font-medium mb-1">Alamat Penjemputan</h3>
                  <p className="text-slate-300 leading-relaxed">{order.pickupAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Detail Section */}
        <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-sky-400 mb-6 flex items-center">
            <Package size={24} className="mr-3" />
            Daftar Barang yang Dititipkan
          </h2>

          <div className="space-y-6">
            {order.entrustedItems.map((item, index) => (
              <div key={item.id} className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-sky-300">{item.name}</h3>
                  <span className="bg-sky-900/50 text-sky-300 px-3 py-1 rounded-full text-sm font-medium">
                    Qty: {item.quantity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start">
                    <Tag size={16} className="text-sky-400 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs text-slate-500 font-medium">Kategori</h4>
                      <p className="text-sm text-slate-300">{item.category || 'Tidak disebutkan'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ShieldCheck size={16} className="text-emerald-400 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs text-slate-500 font-medium">Kondisi</h4>
                      <p className="text-sm text-slate-300">{item.itemCondition || 'Tidak disebutkan'}</p>
                    </div>
                  </div>

                  {item.estimatedValue && (
                    <div className="flex items-start">
                      <DollarSign size={16} className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium">Estimasi Nilai</h4>
                        <p className="text-sm text-slate-300">
                          Rp {parseFloat(item.estimatedValue).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}

                  {item.brand && (
                    <div className="flex items-start">
                      <Tag size={16} className="text-purple-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium">Merek</h4>
                        <p className="text-sm text-slate-300">{item.brand}</p>
                      </div>
                    </div>
                  )}

                  {item.model && (
                    <div className="flex items-start">
                      <Settings size={16} className="text-orange-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium">Model</h4>
                        <p className="text-sm text-slate-300">{item.model}</p>
                      </div>
                    </div>
                  )}

                  {item.color && (
                    <div className="flex items-start">
                      <Palette size={16} className="text-pink-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium">Warna</h4>
                        <p className="text-sm text-slate-300">{item.color}</p>
                      </div>
                    </div>
                  )}
                </div>

                {item.description && (
                  <div className="mb-4">
                    <div className="flex items-start">
                      <FileText size={16} className="text-sky-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium mb-1">Deskripsi</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {item.specialInstructions && (
                  <div>
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium mb-1">Instruksi Khusus</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.specialInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Section - can be expanded later */}
        {order.allowChecks && order.status === 'STORED' && (
          <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-8 mt-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center">
              <Clock size={24} className="mr-3" />
              Riwayat Monitoring
            </h2>
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">Fitur monitoring akan segera tersedia.</p>
              <p className="text-slate-500 text-sm mt-1">
                Frekuensi monitoring: {getMonitoringFrequencyText(order.monitoringFrequency)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}