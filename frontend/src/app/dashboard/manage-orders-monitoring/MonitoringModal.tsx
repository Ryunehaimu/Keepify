'use client';

import React, { useState } from 'react';
import {apiClient} from '@/lib/api'; 
// pastikan path ini sesuai projectmu

// =========================
// TYPES
// =========================

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
  name: string;
  email?: string;
};

type EntrustmentOrder = {
  id: number;
  status: string;
  owner: Owner;
  pickupAddress: string;
  pickupRequestedDate: string;
  entrustedItems: EntrustedItem[];
};

interface MonitoringModalProps {
  order: MonitoringModalOrder;
  onClose: () => void;
  onSuccess: () => void;
}

type MonitoringModalOrder = Omit<EntrustmentOrder, 'owner'> & { 
  owner?: {
    id: number;
    name: string;
    email?: string;
  }
};
// =========================
// COMPONENT
// =========================

export default function MonitoringModal({
  order,
  onClose,
  onSuccess,
}: MonitoringModalProps) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    setLoading(true);

    apiClient
      .adminUpdateStatus(order.id, { status })
      .then(() => {
        onSuccess();
      })
      .catch((err) => {
        console.error(err);
        alert('Gagal update status');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-xl">
        
        {/* HEADER */}
        <h2 className="text-xl font-bold text-white mb-4">
          Monitoring Order #{order.id}
        </h2>

        {/* ORDER SUMMARY */}
        <div className="mb-6 text-slate-300 text-sm space-y-1">
          <p><b>Nama Pemilik:</b> {order.owner?.name}</p>
          <p><b>Alamat Pickup:</b> {order.pickupAddress}</p>
          <p><b>Tanggal Request Pickup:</b> {new Date(order.pickupRequestedDate).toLocaleString()}</p>
          <p><b>Status Saat Ini:</b> {order.status}</p>
        </div>

        {/* ITEMS LIST */}
        <h3 className="text-lg font-semibold text-white mb-2">Detail Barang</h3>
        <div className="space-y-3">
          {order.entrustedItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-700 rounded-md border border-slate-600"
            >
              <p><b>Nama:</b> {item.name}</p>
              <p><b>Jumlah:</b> {item.quantity}</p>
              {item.brand && <p><b>Brand:</b> {item.brand}</p>}
              {item.model && <p><b>Model:</b> {item.model}</p>}
              {item.color && <p><b>Warna:</b> {item.color}</p>}
              {item.description && <p><b>Deskripsi:</b> {item.description}</p>}
            </div>
          ))}
        </div>

        {/* STATUS UPDATE */}
        <div className="mt-6">
          <label className="text-slate-200 block mb-1">Ubah Status Order</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
          >
            <option value="PENDING_PICKUP">Menunggu Dijemput</option>
            <option value="PICKED_UP">Sudah Dijemput</option>
            <option value="STORED">Disimpan</option>
            <option value="PENDING_DELIVERY">Menunggu Diantar</option>
            <option value="DELIVERED">Sudah Diantar</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-700"
          >
            Tutup
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 disabled:bg-slate-500"
          >
            {loading ? 'Menyimpan...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
