'use client';

import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { EntrustmentOrder } from '@/type';
import { apiClient } from '@/lib/api';

interface ModalProps {
  order: EntrustmentOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MonitoringModal({ order, onClose, onSuccess }: ModalProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleCheckboxChange = (id: number) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const clearSignature = () => sigCanvas.current?.clear();
  const isAllChecked = order.entrustedItems?.length === Object.values(checkedItems).filter(Boolean).length;

  const handleSubmit = async () => {
    if (['PENDING_PICKUP', 'PENDING_DELIVERY'].includes(status) && sigCanvas.current?.isEmpty()) {
      setError('Tanda tangan pelanggan diperlukan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (status === 'PENDING_PICKUP') {
        await apiClient.completePickup(order.id, { signatureImage: sigCanvas.current?.toDataURL() || '' });
      }
      else if (status === 'PICKED_UP') await apiClient.adminUpdateStatus(order.id, { status: 'STORED' });
      else if (status === 'STORED') await apiClient.adminUpdateStatus(order.id, { status: 'PENDING_DELIVERY' });
      else if (status === 'PENDING_DELIVERY') await apiClient.adminUpdateStatus(order.id, { status: 'DELIVERED' });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showChecklist = ['PENDING_PICKUP', 'PENDING_DELIVERY'].includes(status);
  const getButtonText = () => {
    switch (status) {
      case 'PENDING_PICKUP': return 'Selesaikan Pickup';
      case 'PICKED_UP': return 'Simpan ke Storage';
      case 'STORED': return 'Request Delivery';
      case 'PENDING_DELIVERY': return 'Selesaikan Delivery';
      case 'DELIVERED': return 'Sudah Selesai';
      default: return 'Update Status';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-slate-800 text-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-sky-400 mb-2">Proses Order #{order.id}</h2>

        {showChecklist && (
          <>
            <div className="space-y-2">
              <h3 className="font-semibold">Checklist Barang:</h3>
              {order.entrustedItems?.map(item => (
                <label key={item.id} className="flex items-center bg-slate-700 p-3 rounded-md cursor-pointer hover:bg-slate-600">
                  <input type="checkbox" className="h-5 w-5 rounded bg-slate-900 border-slate-600 text-sky-500"
                    checked={!!checkedItems[item.id]} onChange={() => handleCheckboxChange(item.id)} />
                  <span className="ml-3 font-medium">{item.name}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Tanda Tangan Pelanggan:</h3>
              <div className="bg-white rounded-md w-full h-48">
                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{ className: 'w-full h-full rounded-md' }} />
              </div>
              <button onClick={clearSignature} className="text-xs text-sky-400 hover:underline">Bersihkan Tanda Tangan</button>
            </div>
          </>
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">Batal</button>
          <button onClick={handleSubmit} disabled={(showChecklist && !isAllChecked) || loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Memproses...' : getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
