'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { EntrustmentOrder } from '@/type';
import { Loader2, Package, Calendar, AlertTriangle, Phone, MapPin, Search, Filter } from 'lucide-react';

export default function ManageAllOrdersPage() {
    const [orders, setOrders] = useState<EntrustmentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        apiClient.getAllOrders()
            .then(data => setOrders(data))
            .catch((err) => {
                setError(err.response?.data?.message || 'Gagal memuat daftar order.');
                console.error("Failed to fetch orders:", err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.owner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactPhone.includes(searchTerm)
    );

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING_PICKUP': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
            case 'PICKED_UP': return 'text-blue-400 bg-blue-900/50 border-blue-700';
            case 'STORED': return 'text-green-400 bg-green-900/50 border-green-700';
            case 'PENDING_DELIVERY': return 'text-orange-400 bg-orange-900/50 border-orange-700';
            case 'DELIVERED': return 'text-slate-400 bg-slate-700/50 border-slate-600';
            default: return 'text-gray-400 bg-gray-700/50 border-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING_PICKUP': return 'Menunggu Penjemputan';
            case 'PICKED_UP': return 'Sudah Dijemput';
            case 'STORED': return 'Disimpan';
            case 'PENDING_DELIVERY': return 'Menunggu Pengantaran';
            case 'DELIVERED': return 'Selesai';
            default: return status?.replace(/_/g, ' ') || 'Tidak Diketahui';
        }
    };

    const getApiBaseUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    };

    const getTotalItems = (order: EntrustmentOrder) => {
        if (!order.entrustedItems) return 0;
        return order.entrustedItems.reduce((total, item) => total + (item.quantity || 1), 0);
    };

    return (
        <div className="space-y-6 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Semua Order</h1>
                    <p className="text-slate-400 mt-1">Kelola dan pantau semua status order dari pengguna.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-500" />
                    </div>
                    <input
                        type="text"
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5"
                        placeholder="Cari ID, Nama, atau No HP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

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
            {!isLoading && !error && filteredOrders.length === 0 && (
                <div className="text-center py-16 bg-slate-800/50 rounded-lg">
                    <Package size={48} className="mx-auto text-slate-500 mb-4" />
                    <p className="text-xl text-slate-400">Tidak ada order yang ditemukan.</p>
                </div>
            )}

            {/* Orders List */}
            {!isLoading && !error && filteredOrders.length > 0 && (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-sky-500/20 transition-shadow duration-300">
                            <div className="flex flex-col lg:flex-row">
                                {/* Image Section */}
                                <div className="lg:w-56 h-48 lg:h-auto relative bg-slate-700 flex-shrink-0">
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
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-sky-400">Order #{order.id}</h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-400">
                                                <span className="font-medium text-slate-300 mr-1">User:</span> {order.owner?.firstName || 'Unknown'} {order.owner?.lastName || ''} ({order.owner?.email})
                                            </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center text-sm text-slate-300">
                                            <Package size={16} className="mr-2 text-sky-400" />
                                            <span>{getTotalItems(order)} barang</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-300">
                                            <Phone size={16} className="mr-2 text-orange-400" />
                                            <span>{order.contactPhone}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-300">
                                            <Calendar size={16} className="mr-2 text-emerald-400" />
                                            <span>{new Date(order.pickupRequestedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        {order.pickupAddress && (
                                            <div className="flex items-start text-sm text-slate-300 md:col-span-3">
                                                <MapPin size={16} className="mr-2 mt-0.5 text-rose-400 flex-shrink-0" />
                                                <span className="line-clamp-1">{order.pickupAddress}</span>
                                            </div>
                                        )}
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
