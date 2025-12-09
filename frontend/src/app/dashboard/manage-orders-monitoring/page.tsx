'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { Loader2, Package, Phone, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import ModalChecklist from './ModalChecklist'; // modal checklist
import ModalSignature from './ModalSignature'; // modal TTD

type EntrustedItem = {
  id: number;
  name: string;
  quantity: number;
  brand?: string;
  model?: string;
  color?: string;
  description?: string;
};

type Owner = {
  id: number;
  firstName?: string;
  email?: string;
};

type EntrustmentOrder = {
  id: number;
  status: string;
  owner?: Owner;
  pickupAddress: string;
  pickupRequestedDate: string;
  entrustedItems: EntrustedItem[];
  imagePath?: string;
  contactPhone?: string;
  createdAt: string;
};

const STATUS_SEQUENCE = ['PENDING_PICKUP', 'PICKED_UP', 'STORED', 'PENDING_DELIVERY', 'DELIVERED'] as const;

export default function ManageOrdersPickupPage() {
  const [orders, setOrders] = useState<EntrustmentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  
  // Modal state
  const [modalChecklistOrder, setModalChecklistOrder] = useState<EntrustmentOrder | null>(null);
  const [modalSignatureOrder, setModalSignatureOrder] = useState<EntrustmentOrder | null>(null);

  const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);
    apiClient.getOrdersByStatus('')
      .then((data: EntrustmentOrder[]) => setOrders(data))
      .catch((err: any) => {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat daftar order.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'PICKED_UP': return 'text-blue-400 bg-blue-900/50 border-blue-700';
      case 'STORED': return 'text-green-400 bg-green-900/50 border-green-700';
      case 'PENDING_DELIVERY': return 'text-orange-400 bg-orange-900/50 border-orange-700';
      case 'DELIVERED': return 'text-teal-400 bg-teal-900/50 border-teal-700';
      default: return 'text-gray-400 bg-gray-700/50 border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PICKUP': return 'Menunggu Penjemputan';
      case 'PICKED_UP': return 'Sudah Dijemput';
      case 'STORED': return 'Disimpan';
      case 'PENDING_DELIVERY': return 'Menunggu Diantar';
      case 'DELIVERED': return 'Sudah Diantar';
      default: return status?.replace(/_/g, ' ') || 'Tidak Diketahui';
    }
  };

  const getTotalItems = (order: EntrustmentOrder) => {
    if (!order.entrustedItems) return 0;
    return order.entrustedItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Function tombol next status
  const handleNextStatusClick = (order: EntrustmentOrder) => {
    // Tentukan status berikutnya
    const currentIndex = STATUS_SEQUENCE.indexOf(order.status as typeof STATUS_SEQUENCE[number]);
    const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
    if (!nextStatus) return; // sudah terakhir

    // Tampilkan modal sesuai status
    if (nextStatus === 'STORED') {
      setModalChecklistOrder(order);
    } else if (nextStatus === 'DELIVERED') {
      setModalSignatureOrder(order);
    } else {
      updateStatus(order, nextStatus);
    }
  };

  const updateStatus = async (order: EntrustmentOrder, nextStatus: string, signatureImage?: string) => {
    setUpdatingIds(prev => [...prev, order.id]);
    try {
      if (order.status === 'PENDING_PICKUP' && nextStatus === 'PICKED_UP') {
        await apiClient.completePickup(order.id, { signatureImage: signatureImage || '' });
      } else {
        await apiClient.adminUpdateStatus(order.id, { status: nextStatus });
      }

      setOrders(prev =>
        prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o)
      );
    } catch (err) {
      console.error(err);
      alert('Gagal update status');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order.id));
    }
  };

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-sky-400 mb-4">Kelola Order</h1>

      {isLoading && <div className="flex justify-center items-center py-10"><Loader2 size={32} className="animate-spin text-sky-500" /><p className="ml-3 text-slate-300">Memuat daftar order...</p></div>}
      {error && !isLoading && <div className="bg-red-800/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg flex items-center"><AlertTriangle size={24} className="mr-3 text-red-400" /><div><p className="font-semibold">Gagal memuat data</p><p className="text-sm">{error}</p></div></div>}

      {!isLoading && !error && orders.length === 0 && <div className="text-center py-16 bg-slate-800/50 rounded-lg"><Package size={48} className="mx-auto text-slate-500 mb-4" /><p className="text-xl text-slate-400">Tidak ada order yang perlu diproses.</p></div>}

      {!isLoading && !error && orders.map(order => {
        const currentIndex = STATUS_SEQUENCE.indexOf(order.status as typeof STATUS_SEQUENCE[number]);
        const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
        const isUpdating = updatingIds.includes(order.id);

        return (
          <div key={order.id} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-sky-500/20 transition-shadow duration-300 mb-6">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-64 h-48 lg:h-auto relative bg-slate-700 flex-shrink-0">
                {order.imagePath ? (
                  <Image src={`${getApiBaseUrl()}/${order.imagePath.replace(/\\/g, '/')}`} alt={`Order #${order.id}`} layout="fill" objectFit="cover" />
                ) : <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-slate-500" /></div>}
              </div>

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
                    <p>{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-300"><Package size={16} className="mr-2 text-sky-400" />{getTotalItems(order)} barang ({order.entrustedItems.length} jenis)</div>
                  <div className="flex items-center text-sm text-slate-300"><Phone size={16} className="mr-2 text-orange-400" />{order.contactPhone}</div>
                  <div className="flex items-center text-sm text-slate-300 col-span-2"><Calendar size={16} className="mr-2 text-emerald-400" />Jadwal Jemput: {new Date(order.pickupRequestedDate).toLocaleString('id-ID')}</div>
                  <div className="flex items-start text-sm text-slate-300 col-span-2"><MapPin size={16} className="mr-2 mt-0.5 text-rose-400 flex-shrink-0" />{order.pickupAddress}</div>
                </div>

                {nextStatus && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleNextStatusClick(order)}
                      disabled={isUpdating}
                      className="px-6 py-2 font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-slate-500"
                    >
                      {isUpdating ? 'Updating...' : `Ubah ke: ${getStatusText(nextStatus)}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* MODAL CHECKLIST */}
      {modalChecklistOrder && (
        <ModalChecklist
          order={modalChecklistOrder}
          onClose={() => setModalChecklistOrder(null)}
          onConfirm={() => {
            updateStatus(modalChecklistOrder, 'STORED');
            setModalChecklistOrder(null);
          }}
        />
      )}

      {/* MODAL SIGNATURE */}
      {modalSignatureOrder && (
        <ModalSignature
          order={modalSignatureOrder}
          onClose={() => setModalSignatureOrder(null)}
          onConfirm={(signatureImage) => {
            updateStatus(modalSignatureOrder, 'DELIVERED', signatureImage);
            setModalSignatureOrder(null);
          }}
        />
      )}
    </div>
  );
}
