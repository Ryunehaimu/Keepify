'use client';

import React, { useRef, useState } from 'react';
import { EntrustmentOrder as BaseOrder} from '@/type';

// di ModalSignature.tsx
interface ModalSignatureProps {
  order: Pick<BaseOrder, 'id'>; // modal signature hanya butuh id
  onClose: () => void;
  onConfirm: (signatureImage: string) => void;
}

export default function ModalSignature({ order, onClose, onConfirm }: ModalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => setDrawing(true);
  const endDraw = () => setDrawing(false);
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleConfirm = () => {
    if (canvasRef.current) {
      onConfirm(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Tanda Tangan Order #{order.id}</h2>
        <p className="text-slate-300 mb-2">Silakan tanda tangani di area berikut:</p>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="border border-slate-600 bg-white mb-4"
          onMouseDown={startDraw}
          onMouseUp={endDraw}
          onMouseMove={draw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchEnd={endDraw}
          onTouchMove={draw}
        />
        <div className="flex justify-between">
          <button onClick={clearCanvas} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">
            Hapus
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-700">
              Batal
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
