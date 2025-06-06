'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { EntrustmentOrder } from '@/type';
import { Loader2, Package, User, Calendar, AlertTriangle, Clock, Phone, MapPin } from 'lucide-react';
import { PickupProcessModal } from './PickupProcessModal';

export default function ManageOrdersPickupPage() {
  // State management (tetap sama)
  const [orders, setOrders] = useState<EntrustmentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<EntrustmentOrder | null>(null);

  // Fungsi data fetching dan modal handler (tetap sama)
  const fetchPendingPickups = () => {
    setIsLoading(true);
    setError(null);
    apiClient.getOrdersByStatus('PENDING_PICKUP')
      .then(data => setOrders(data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Gagal memuat daftar penitipan.');
        console.error("Failed to fetch orders:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPendingPickups();
  }, []);

  const handleOpenModal = (order: EntrustmentOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handlePickupSuccess = () => {
    setIsModalOpen(false);
    alert('Order berhasil diproses!');
    fetchPendingPickups(); 
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'PICKED_UP': return 'text-blue-400 bg-blue-900/50 border-blue-700';
      case 'STORED': return 'text-green-400 bg-green-900/50 border-green-700';
      default: return 'text-gray-400 bg-gray-700/50 border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'Menunggu Penjemputan';
      case 'PICKED_UP': return 'Sudah Dijemput';
      case 'STORED': return 'Disimpan';
      // ... tambahkan status lain jika perlu
      default: return status?.replace(/_/g, ' ') || 'Tidak Diketahui';
    }
  };
  
  const getTotalItems = (order: EntrustmentOrder) => {
    if (!order.entrustedItems) return 0;
    return order.entrustedItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getApiBaseUrl = () => {
    // Pastikan variabel environment ini ada di .env.local Anda
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Kelola Order Pickup</h1>
          <p className="text-slate-400 mt-1">Daftar order yang menunggu untuk dijemput dari pelanggan.</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <PickupProcessModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onSuccess={handlePickupSuccess}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 size={32} className="animate-spin text-sky-500" />
          <p className="ml-3 text-slate-300">Memuat daftar order...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-800/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg flex items-center">
          <AlertTriangle size={24} className="mr-3 text-red-400" />
          <div>
            <p className="font-semibold">Gagal memuat data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-16 bg-slate-800/50 rounded-lg">
          <Package size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-xl text-slate-400">Tidak ada order yang perlu di-pickup.</p>
          <p className="text-slate-500 mt-1">Semua pekerjaan sudah beres!</p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length > 0 && (
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
                      className="transition-transform duration-300 group-hover:scale-105"
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
                      <h3 className="text-xl font-semibold text-sky-400 mb-2">Order #{order.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-right text-sm text-slate-400 mt-2 sm:mt-0">
                      <p>Dibuat oleh: {order.owner?.firstName || 'User'}</p>
                      <p>{new Date(order.createdAt).toLocaleDateString('id-ID', { 
                        day: 'numeric', // <-- DIUBAH MENJADI 'numeric'
                        month: 'short', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  {/* Order Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-300">
                      <Package size={16} className="mr-2 text-sky-400" />
                      <span>{getTotalItems(order)} barang ({order.entrustedItems.length} jenis)</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Phone size={16} className="mr-2 text-orange-400" />
                      <span>{order.contactPhone}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300 col-span-2">
                      <Calendar size={16} className="mr-2 text-emerald-400" />
                      <span>Jadwal Jemput: {new Date(order.pickupRequestedDate).toLocaleString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}</span>
                    </div>
                     <div className="flex items-start text-sm text-slate-300 col-span-2">
                        <MapPin size={16} className="mr-2 mt-0.5 text-rose-400 flex-shrink-0" />
                        <span className="line-clamp-2">{order.pickupAddress}</span>
                      </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-700">
                    <button
                      onClick={() => handleOpenModal(order)}
                      className="px-6 py-2 font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Proses Pickup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}