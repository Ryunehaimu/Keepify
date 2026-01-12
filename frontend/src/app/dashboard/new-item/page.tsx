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
  User,
  UserPlus,
  X,
  Check,
  Search
} from "lucide-react";

// Enum types (match backend)
enum MonitoringFrequency {
  NONE = "none",
  WEEKLY_ONCE = "weekly_once",
  WEEKLY_TWICE = "weekly_twice",
}

// Fungsi hitung estimasi live
const calculateLiveEstimate = (items: any[], frequency: string, pickupDate: string, retrievalDate?: string, isPickupRequired?: boolean, pickupDistance?: number) => {
  const PRICE_PER_KG_PER_DAY = 2000;
  const PICKUP_PRICE_PER_KM = 10000; // Adjust as needed
  const MONITORING_FEE: Record<string, number> = {
    none: 0,
    weekly_once: 5000,
    weekly_twice: 10000
  };

  const start = pickupDate ? new Date(pickupDate) : new Date(); // Use today if no pickup date
  // if (isNaN(start.getTime())) return 0; // Allow calc even without pickup date for simulation

  // Default simulasi 7 hari jika tgl pengambilan kosong
  const end = retrievalDate ? new Date(retrievalDate) : new Date(start.getTime() + 7 * 86400000);
  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const storageTotal = items.reduce((total, item) => {
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

  const pickupFee = (isPickupRequired && pickupDistance && pickupDistance > 1) 
    ? (pickupDistance * 2500) 
    : 0;
  
  return storageTotal + pickupFee;
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
  isPickupRequired: z.boolean().default(false), // New field
  allowChecks: z.boolean().default(true),
  monitoringFrequency: z.nativeEnum(MonitoringFrequency).optional(),
  pickupRequestedDate: z.string().optional(), // Now optional initially
  pickupAddress: z.string().optional(),
  pickupDistance: z.coerce.number().optional(), // New field
  contactPhone: z.string().min(10, "Minimal 10 digit").max(20),
  expectedRetrievalDate: z.string().optional(),
  entrustedItems: z.array(entrustedItemSchema).min(1, "Harus ada minimal satu barang"),
}).superRefine((data, ctx) => {
  // Conditional Validation for Pickup
  if (data.isPickupRequired) {
    if (!data.pickupRequestedDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal penjemputan harus diisi", path: ["pickupRequestedDate"] });
    }
    if (!data.pickupAddress || data.pickupAddress.length < 10) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Alamat minimal 10 karakter", path: ["pickupAddress"] });
    }
    if (!data.pickupDistance || data.pickupDistance <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Jarak harus diisi ( > 0 km)", path: ["pickupDistance"] });
    }
  }

  // Conditional Validation for Monitoring
  if (data.allowChecks && !data.monitoringFrequency) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih frekuensi monitoring jika mengizinkan pemeriksaan", path: ["monitoringFrequency"] });
  }
});

type EntrustmentOrderFormData = z.infer<typeof entrustmentOrderSchema>;

type UserType = {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
};

export default function NewEntrustmentOrderPage() {
  const { token, isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Admin specific states
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAdminUserLoading, setIsAdminUserLoading] = useState(false);
  
  // Register user modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false); // Acts as 'step' toggle: false=form, true=otp
  const [otp, setOtp] = useState("");

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
  const isPickupRequired = watch("isPickupRequired");
  const pickupDistance = watch("pickupDistance");
  const allowChecks = watch("allowChecks");

  const currentEstimate = calculateLiveEstimate(watchedItems, watchedFreq, watchedPickup || "", watchedRetrieval, isPickupRequired, pickupDistance);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) router.push("/login?message=Silakan login");
  }, [authIsLoading, isAuthenticated, router]);

  // Fetch users if Admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === "admin") {
        setIsAdminUserLoading(true);
        try {
          const res = await apiClient.get("/admin/users");
          setUsers(res);
        } catch (err) {
          console.error("Failed to fetch users", err);
        } finally {
          setIsAdminUserLoading(false);
        }
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPackageImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step 1: Request OTP
    if (!isRegistering) {
       setIsAdminUserLoading(true); // Reuse loading state
       try {
         await apiClient.sendRegisterOtp(registerData.email);
         setIsRegistering(true); // Switch to OTP view
       } catch (err: any) {
         alert(err.response?.data?.message || "Gagal mengirim OTP.");
       } finally {
         setIsAdminUserLoading(false);
       }
       return;
    }

    // Step 2: Verify OTP & Register
    if (otp.length < 4) return;
    setIsAdminUserLoading(true);
    
    try {
      // Use standard register endpoint with OTP
      const payload = { ...registerData, otp };
      const res = await apiClient.register(payload);
      
      // Refresh user list
      const usersRes: UserType[] = await apiClient.get("/admin/users");
      setUsers(usersRes);
      
      // Auto-select new user
      const newUser = usersRes.find(u => u.email === registerData.email);
      if (newUser) {
        setSelectedUserId(newUser.id.toString());
      }
      
      setIsRegisterModalOpen(false);
      setRegisterData({ firstName: "", lastName: "", email: "", password: "" });
      setOtp("");
      setIsRegistering(false);
      alert("User berhasil didaftarkan!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal verifikasi OTP / Daftar.");
    } finally {
      setIsAdminUserLoading(false);
    }
  };

  const onSubmit: SubmitHandler<EntrustmentOrderFormData> = async (data) => {
    if (!token) return;

    if (user?.role === "admin" && !selectedUserId) {
      setServerError("Harap pilih user pemilik barang terlebih dahulu.");
      window.scrollTo(0,0);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("allowChecks", data.allowChecks.toString());
      formData.append("isPickupRequired", data.isPickupRequired ? "true" : "false"); // Boolean as string
      if (data.isPickupRequired && data.pickupDistance) {
         formData.append("pickupDistance", data.pickupDistance.toString());
      }
      formData.append("monitoringFrequency", data.allowChecks ? data.monitoringFrequency || MonitoringFrequency.NONE : MonitoringFrequency.NONE);
      if (data.pickupRequestedDate) formData.append("pickupRequestedDate", data.pickupRequestedDate);
      if (data.pickupAddress) formData.append("pickupAddress", data.pickupAddress);
      
      formData.append("contactPhone", data.contactPhone);
      if (data.expectedRetrievalDate) formData.append("expectedRetrievalDate", data.expectedRetrievalDate);
      formData.append("entrustedItems", JSON.stringify(data.entrustedItems));
      if (packageImage) formData.append("image", packageImage);
      
      // Admin: Attach ownerId
      if (user?.role === "admin" && selectedUserId) {
        formData.append("ownerId", selectedUserId);
      }

      await apiClient.createEntrustmentOrder(formData);
      router.push("/dashboard/my-items");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Gagal membuat order.");
      window.scrollTo(0,0);
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

          {serverError && (
             <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex items-center">
               <X className="mr-2" size={20} />
               {serverError}
             </div>
          )}

          {/* Admin: User Selection */}
          {user?.role === "admin" && (
            <div className="bg-sky-900/20 border border-sky-700/50 p-6 rounded-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sky-400">
                  <User size={24} className="mr-2" />
                  <h2 className="text-xl font-semibold">Pilih Pemilik Barang (Admin Only)</h2>
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex items-center text-sm bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <UserPlus size={16} className="mr-2" />
                  Daftarkan User Baru
                </button>
              </div>
              
              {isAdminUserLoading ? (
                <p className="text-slate-400 text-sm">Memuat daftar user...</p>
              ) : (
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1.5">Pilih User Terdaftar</label>
                   <div className="relative">
                      <select 
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full appearance-none bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                      >
                        <option value="">-- Pilih User --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.email})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <Search size={18} />
                      </div>
                   </div>
                   {!selectedUserId && (
                     <p className="text-amber-400 text-xs mt-2 flex items-center">
                       <UserPlus size={12} className="mr-1" />
                       Wajib pilih user untuk membuat order atas nama orang lain.
                     </p>
                   )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. Pickup Information */}
            {/* 1. Pickup Information */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center mb-4 text-emerald-400">
                <MapPin size={24} className="mr-2" /> 
                <h2 className="text-xl font-semibold">Informasi Penjemputan</h2>
              </div>
              
              {/* Checkbox Optional Pickup */}
              <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                    <input 
                      id="isPickupRequired" 
                      type="checkbox" 
                      {...register("isPickupRequired")} 
                      className="h-5 w-5 rounded bg-slate-700 text-emerald-500 focus:ring-emerald-500/50" 
                    />
                    <div>
                        <label htmlFor="isPickupRequired" className="font-medium text-emerald-400 block cursor-pointer">
                            Butuh layanan penjemputan?
                        </label>
                        <p className="text-xs text-slate-400">Gratis &le; 1 km, selanjutnya Rp 2.500 / km</p>
                    </div>
                </div>
              </div>

             {/* Fields Section - Rendered only if checked */}
             {watch("isPickupRequired") && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6 border-l-2 border-emerald-500/30 pl-4 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tanggal & Jam Penjemputan *</label>
                      <input type="datetime-local" {...register("pickupRequestedDate")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" />
                      {errors.pickupRequestedDate && <p className="text-red-400 text-xs mt-1.5">{errors.pickupRequestedDate.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Est. Jarak ke Gudang (km) *</label>
                       <div className="relative">
                          <input type="number" step="0.1" {...register("pickupDistance")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" placeholder="Contoh: 5.2" />
                          <span className="absolute right-4 top-2.5 text-slate-500">km</span>
                       </div>
                      {errors.pickupDistance && <p className="text-red-400 text-xs mt-1.5">{errors.pickupDistance.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Alamat Penjemputan *</label>
                    <textarea {...register("pickupAddress")} rows={3} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" placeholder="Alamat lengkap..." />
                    {errors.pickupAddress && <p className="text-red-400 text-xs mt-1.5">{errors.pickupAddress.message}</p>}
                  </div>
              </div>
             )}

              {/* Contact Phone (Always required) */}
              <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nomor Telepon Kontak *</label>
                  <input type="tel" {...register("contactPhone")} className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg" placeholder="08..." />
                  {errors.contactPhone && <p className="text-red-400 text-xs mt-1.5">{errors.contactPhone.message}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Perkiraan Tanggal Pengambilan *</label>
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

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => {
                setIsRegisterModalOpen(false);
                setIsRegistering(false);
                // Reset state jika ditutup paksa
                // setRegisterStep('form'); 
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-1 flex items-center">
              <UserPlus size={24} className="mr-2 text-sky-400" />
              {isRegistering ? 'Verifikasi OTP' : 'Registrasi User Baru'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">User akan langsung terpilih setelah terdaftar.</p>
            
            {!isRegistering ? (
              <form onSubmit={handleRegisterUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nama Depan</label>
                    <input 
                      required 
                      type="text" 
                      value={registerData.firstName}
                      onChange={e => setRegisterData({...registerData, firstName: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:border-sky-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nama Belakang</label>
                    <input 
                      type="text" 
                      value={registerData.lastName}
                      onChange={e => setRegisterData({...registerData, lastName: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:border-sky-500 outline-none" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={registerData.email}
                    onChange={e => setRegisterData({...registerData, email: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:border-sky-500 outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
                  <input 
                    required 
                    type="password" 
                    value={registerData.password}
                    onChange={e => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:border-sky-500 outline-none" 
                  />
                </div>

                <div className="flex gap-2">
                   <button 
                    type="submit" 
                    disabled={isAdminUserLoading} // Reuse state loading yg ada atau buat baru
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors disabled:opacity-50"
                  >
                    Kirim OTP
                  </button>
                </div>
              </form>
            ) : (
               <form onSubmit={handleRegisterUser} className="space-y-6">
                 <div className="text-center">
                   <p className="text-slate-300 mb-4">
                     Kode OTP dikirim ke <span className="text-white font-bold">{registerData.email}</span>
                   </p>
                   <input
                     type="text"
                     maxLength={6}
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                     className="block w-full text-center text-3xl tracking-[1em] font-bold bg-slate-700 border border-slate-600 rounded-lg py-3 text-white focus:ring-sky-500 focus:border-sky-500"
                     placeholder="......"
                     autoFocus
                   />
                   <p className="text-xs text-slate-500 mt-2">Masukkan 6 digit kode OTP</p>
                 </div>

                 <div className="flex gap-2">
                   <button 
                    type="button" 
                    onClick={() => setIsRegistering(false)}
                    className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-lg transition-colors"
                  >
                    Kembali
                  </button>
                   <button 
                    type="submit" 
                    disabled={isAdminUserLoading || otp.length < 4}
                    className="w-2/3 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isAdminUserLoading ? "Memproses..." : "Verifikasi & Daftar"}
                  </button>
                 </div>
               </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}