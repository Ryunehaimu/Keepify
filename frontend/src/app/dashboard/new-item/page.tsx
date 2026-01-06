"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  UploadCloud,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  Maximize,
  Weight,
} from "lucide-react";

// Enum types (match backend)
enum MonitoringFrequency {
  NONE = "none",
  WEEKLY_ONCE = "weekly_once",
  WEEKLY_TWICE = "weekly_twice",
}

// Fungsi hitung estimasi live
const calculateLiveEstimate = (items: any[], frequency: string, pickupDate: string, retrievalDate?: string) => {
  const PRICE_PER_KG_PER_DAY = 2000;
  const MONITORING_FEE: Record<string, number> = {
    none: 0,
    weekly_once: 5000,
    weekly_twice: 10000
  };

  const start = new Date(pickupDate);
  if (isNaN(start.getTime())) return 0;

  // Default simulasi 7 hari jika tgl pengambilan kosong
  const end = retrievalDate ? new Date(retrievalDate) : new Date(start.getTime() + 7 * 86400000);
  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  return items.reduce((total, item) => {
    const weight = Number(item.itemWeight) || 0;
    const length = Number(item.itemLength) || 0;
    const width = Number(item.itemWidth) || 0;
    const height = Number(item.itemHeight) || 0;
    
    // Logika Volumetrik: (P x L x T) / 6000
    const volumeWeight = (length * width * height) / 6000;
    const finalWeight = Math.max(weight, volumeWeight);
    
    const monitoringPrice = MONITORING_FEE[frequency] || 0;
    const itemBasePrice = (finalWeight * PRICE_PER_KG_PER_DAY * diffDays);
    const itemTotal = (itemBasePrice + monitoringPrice) * (Number(item.quantity) || 1);
    
    return total + itemTotal;
  }, 0);
};

// Individual item schema
const entrustedItemSchema = z.object({
  name: z.string().min(3, "Nama barang minimal 3 karakter").max(255),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(500).optional(),
  category: z.string().min(1, "Kategori harus diisi").max(100).optional(),
  estimatedValue: z.unknown().transform((val, ctx) => {
    if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) return undefined;
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nilai harus berupa angka > 0" });
      return z.NEVER;
    }
    return num.toString();
  }).optional(),
  itemCondition: z.string().min(3, "Kondisi minimal 3 karakter").optional(),
  itemLength: z.coerce.number().min(1, "Minimal 1 cm").default(1),
  itemWidth: z.coerce.number().min(1, "Minimal 1 cm").default(1),
  itemHeight: z.coerce.number().min(1, "Minimal 1 cm").default(1),
  itemWeight: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  quantity: z.coerce.number().min(1, "Jumlah minimal 1").default(1),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  specialInstructions: z.string().max(500).optional(),
});

const entrustmentOrderSchema = z.object({
  allowChecks: z.boolean().default(true),
  monitoringFrequency: z.nativeEnum(MonitoringFrequency).optional(),
  pickupRequestedDate: z.string().min(1, "Tanggal dan jam penjemputan harus diisi"),
  pickupAddress: z.string().min(10, "Alamat minimal 10 karakter").max(500),
  contactPhone: z.string().min(10, "Minimal 10 digit").max(20),
  expectedRetrievalDate: z.string().optional(),
  entrustedItems: z.array(entrustedItemSchema).min(1, "Harus ada minimal satu barang"),
}).refine((data) => !data.allowChecks || data.monitoringFrequency, {
  message: "Pilih frekuensi monitoring jika mengizinkan pemeriksaan",
  path: ["monitoringFrequency"],
});

type EntrustmentOrderFormData = z.infer<typeof entrustmentOrderSchema>;

export default function NewEntrustmentOrderPage() {
  const { token, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<EntrustmentOrderFormData>({
    resolver: zodResolver(entrustmentOrderSchema),
    defaultValues: {
      allowChecks: true,
      monitoringFrequency: MonitoringFrequency.NONE,
      entrustedItems: [{ name: "", itemLength: 1, itemHeight: 1, itemWidth: 1, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "entrustedItems" });
  
  const watchedItems = watch("entrustedItems");
  const watchedFreq = watch("monitoringFrequency") || "none";
  const watchedPickup = watch("pickupRequestedDate");
  const watchedRetrieval = watch("expectedRetrievalDate");
  const allowChecks = watch("allowChecks");

  const currentEstimate = calculateLiveEstimate(watchedItems, watchedFreq, watchedPickup, watchedRetrieval);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) router.push("/login?message=Silakan login");
  }, [authIsLoading, isAuthenticated, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPackageImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<EntrustmentOrderFormData> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("allowChecks", data.allowChecks.toString());
      formData.append("monitoringFrequency", data.allowChecks ? data.monitoringFrequency || MonitoringFrequency.NONE : MonitoringFrequency.NONE);
      formData.append("pickupRequestedDate", data.pickupRequestedDate);
      formData.append("pickupAddress", data.pickupAddress);
      formData.append("contactPhone", data.contactPhone);
      if (data.expectedRetrievalDate) formData.append("expectedRetrievalDate", data.expectedRetrievalDate);
      formData.append("entrustedItems", JSON.stringify(data.entrustedItems));
      if (packageImage) formData.append("image", packageImage);

      await apiClient.createEntrustmentOrder(formData);
      router.push("/dashboard/my-items");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Gagal membuat order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl">
          <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
            <PackagePlus size={28} className="text-sky-400 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-400">Formulir Penitipan Barang</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. Pickup Information */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center mb-4 text-emerald-400"><MapPin size={24} className="mr-2" /> <h2 className="text-xl font-semibold">Informasi Penjemputan</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tanggal & Jam Penjemputan *</label>
                  <input type="datetime-local" {...register("pickupRequestedDate")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" />
                  {errors.pickupRequestedDate && <p className="text-red-400 text-xs mt-1.5">{errors.pickupRequestedDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nomor Telepon *</label>
                  <input type="tel" {...register("contactPhone")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" placeholder="08..." />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Alamat Penjemputan *</label>
                <textarea {...register("pickupAddress")} rows={3} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" placeholder="Alamat lengkap..." />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Perkiraan Tanggal Pengambilan (Opsional)</label>
                <input type="date" {...register("expectedRetrievalDate")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" />
              </div>
            </div>

            {/* 2. Monitoring Preferences */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center mb-4 text-purple-400"><Clock size={24} className="mr-2" /> <h2 className="text-xl font-semibold">Preferensi Monitoring</h2></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input id="allowChecks" type="checkbox" {...register("allowChecks")} className="h-4 w-4 rounded bg-slate-700 text-purple-600" />
                  <label htmlFor="allowChecks" className="text-sm text-slate-300">Izinkan pemeriksaan berkala</label>
                </div>
                {allowChecks && (
                  <div className="pl-7 space-y-2">
                    {Object.values(MonitoringFrequency).map((freq) => (
                      <label key={freq} className="flex items-center text-sm text-slate-300 cursor-pointer">
                        <input type="radio" value={freq} {...register("monitoringFrequency")} className="mr-3" />
                        {freq === 'none' ? 'Tidak perlu' : freq.replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Item Details */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-sky-400"><PackagePlus size={24} className="mr-2" /> <h2 className="text-xl font-semibold">Daftar Barang</h2></div>
                <button type="button" onClick={() => append({ name: "", itemLength: 1, itemHeight: 1, itemWidth: 1, quantity: 1 })} className="flex items-center bg-sky-600 px-3 py-2 rounded-lg text-sm hover:bg-sky-700"><Plus size={16} className="mr-1" /> Tambah</button>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-slate-600/30 p-5 rounded-lg relative">
                    {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-300"><Trash2 size={18} /></button>}
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Barang {index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Nama Barang *</label>
                        <input {...register(`entrustedItems.${index}.name`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Kategori</label>
                        <input {...register(`entrustedItems.${index}.category`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Kondisi</label>
                        <input {...register(`entrustedItems.${index}.itemCondition`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Deskripsi</label>
                        <textarea {...register(`entrustedItems.${index}.description`)} rows={2} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" />
                      </div>

                      {/* Dimensi & Berat */}
                      <div className="grid grid-cols-3 gap-3 md:col-span-1">
                        <div><label className="text-[10px] text-slate-500 uppercase">P (cm)</label><input type="number" {...register(`entrustedItems.${index}.itemLength`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase">L (cm)</label><input type="number" {...register(`entrustedItems.${index}.itemWidth`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase">T (cm)</label><input type="number" {...register(`entrustedItems.${index}.itemHeight`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-400 mb-1 block">Berat (kg)</label><input type="number" step="0.1" {...register(`entrustedItems.${index}.itemWeight`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                        <div><label className="text-xs text-slate-400 mb-1 block">Qty</label><input type="number" {...register(`entrustedItems.${index}.quantity`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      </div>

                      {/* Field Fleksibel Lainnya */}
                      <div><label className="text-xs text-slate-400 mb-1 block">Merek</label><input {...register(`entrustedItems.${index}.brand`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      <div><label className="text-xs text-slate-400 mb-1 block">Model</label><input {...register(`entrustedItems.${index}.model`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      <div><label className="text-xs text-slate-400 mb-1 block">Warna</label><input {...register(`entrustedItems.${index}.color`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      <div><label className="text-xs text-slate-400 mb-1 block">Estimasi Nilai</label><input {...register(`entrustedItems.${index}.estimatedValue`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                      <div className="md:col-span-2"><label className="text-xs text-slate-400 mb-1 block">Instruksi Khusus</label><input {...register(`entrustedItems.${index}.specialInstructions`)} className="w-full bg-slate-700/50 p-2 rounded border border-slate-600" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Estimasi Biaya Live */}
            <div className="bg-sky-900/40 border border-sky-500/50 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-sky-300 font-bold text-lg flex items-center"><DollarSign size={20} className="mr-1" /> Estimasi Total Biaya</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">* Dihitung dari Berat Aktual/Volumetrik & Durasi</p>
              </div>
              <div className="text-right"><span className="text-4xl font-black text-white">Rp {currentEstimate.toLocaleString('id-ID')}</span></div>
            </div>

            {/* 5. Upload Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Foto Paket (Opsional)</label>
              <div className="border-2 border-dashed border-slate-600 p-6 rounded-lg text-center hover:border-sky-500 cursor-pointer">
                {imagePreview ? <img src={imagePreview} className="h-32 mx-auto rounded" /> : <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />}
                <label className="block text-sky-400 mt-2 cursor-pointer font-medium"><span>Pilih Gambar</span><input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-sky-600 py-4 rounded-xl font-bold text-lg hover:bg-sky-700 disabled:opacity-50 transition-all">
              {isSubmitting ? "Memproses Order..." : "Buat Order Penitipan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}