// src/app/dashboard/manage-orders-pickup/PickupProcessModal.tsx
'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { EntrustmentOrder, EntrustedItem } from '@/type'; // Impor tipe yang benar

interface Props {
  order: EntrustmentOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export function PickupProcessModal({ order, onClose, onSuccess }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleCheckboxChange = (itemId: number) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // ===================================================================
  // PERBAIKAN 1: Gunakan 'entrustedItems' bukan 'items'
  // Ditambahkan juga optional chaining (?.) untuk keamanan
  const isAllChecked = order.entrustedItems?.length === Object.values(checkedItems).filter(Boolean).length;
  // ===================================================================

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };
  
  const handleSubmit = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('Tanda tangan pelanggan diperlukan.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // PERBAIKAN: Panggil .toDataURL() langsung pada ref canvas
    const signatureImage = sigCanvas.current?.toDataURL('image/png') || '';
    
    apiClient.completePickup(order.id, { signatureImage })
      .then(() => {
        onSuccess();
      })
      .catch(err => {
        setError(err.message || 'Gagal menyelesaikan pickup. Coba lagi.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-slate-800 text-white rounded-lg p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-sky-400">Proses Pickup Order #{order.id}</h2>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Checklist Verifikasi Barang:</h3>
          {order.entrustedItems?.map((item: EntrustedItem) => (
          // ===================================================================
            <label key={item.id} className="flex items-center bg-slate-700 p-3 rounded-md cursor-pointer hover:bg-slate-600">
              <input
                type="checkbox"
                className="h-5 w-5 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
                checked={!!checkedItems[item.id]}
                onChange={() => handleCheckboxChange(item.id)}
              />
              <span className="ml-3 font-medium">{item.name}</span>
              <span className="ml-auto text-sm text-slate-400">{item.description || 'Tanpa deskripsi'}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Perjanjian dan Tanda Tangan Pelanggan:</h3>
          <p className="text-xs text-slate-400 p-2 border border-slate-600 rounded-md">
            Saya selaku pelanggan mengonfirmasi bahwa seluruh barang yang tertera telah diperiksa dan dijemput oleh pihak Keepify dalam kondisi sesuai.
          </p>
          <div className="bg-white rounded-md w-full h-48">
            <SignatureCanvas
              ref={sigCanvas}
              penColor='black'
              canvasProps={{ className: 'w-full h-full rounded-md' }}
            />
          </div>
          <button onClick={clearSignature} className="text-xs text-sky-400 hover:underline">
            Bersihkan Tanda Tangan
          </button>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isAllChecked || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Memproses...' : 'Selesaikan Pickup'}
          </button>
        </div>
      </div>
    </div>
  );
}