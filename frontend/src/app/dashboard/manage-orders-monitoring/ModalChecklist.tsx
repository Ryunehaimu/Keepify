'use client';

import React from 'react';
import { EntrustmentOrder as BaseOrder } from '@/type';

interface ModalChecklistProps {
  order: Pick<BaseOrder, 'id' | 'entrustedItems'>; // hanya properti yang dipakai di modal
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalChecklist({ order, onClose, onConfirm }: ModalChecklistProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Checklist Penyimpanan Order #{order.id}</h2>
        <p className="text-slate-300 mb-4">
          Pastikan semua barang sudah disimpan dengan baik sebelum melanjutkan.
        </p>
        <ul className="text-slate-200 mb-4 list-disc list-inside">
          {order.entrustedItems.map(item => (
            <li key={item.id}>{item.name} ({item.quantity})</li>
          ))}
        </ul>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-700">
            Batal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
