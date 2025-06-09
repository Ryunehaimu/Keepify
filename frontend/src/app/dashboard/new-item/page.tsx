// src/app/dashboard/new-item/page.tsx
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
} from "lucide-react";

// Enum types (should match backend)
enum MonitoringFrequency {
  NONE = "none",
  WEEKLY_ONCE = "weekly_once",
  WEEKLY_TWICE = "weekly_twice",
}

// Individual item schema
const entrustedItemSchema = z.object({
  name: z
    .string()
    .min(3, "Nama barang minimal 3 karakter")
    .max(255, "Nama barang maksimal 255 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  category: z
    .string()
    .min(1, "Kategori harus diisi")
    .max(100, "Kategori maksimal 100 karakter")
    .optional(),
  estimatedValue: z
    .unknown()
    .transform((val, ctx) => {
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "")
      ) {
        return undefined;
      }
      const num = Number(val);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Estimasi nilai harus berupa angka atau dikosongkan.",
        });
        return z.NEVER;
      }
      if (num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Estimasi nilai harus lebih dari 0 jika diisi.",
        });
        return z.NEVER;
      }
      return num.toString(); // Backend expects string
    })
    .optional(),
  itemCondition: z
    .string()
    .min(3, "Kondisi barang minimal 3 karakter")
    .optional(),
  quantity: z.number().min(1, "Jumlah minimal 1").default(1),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  specialInstructions: z.string().max(500).optional(),
});

// Main entrustment order schema
const entrustmentOrderSchema = z
  .object({
    allowChecks: z.boolean().default(true),
    monitoringFrequency: z.nativeEnum(MonitoringFrequency).optional(),
    pickupRequestedDate: z
      .string()
      .min(1, "Tanggal dan jam penjemputan harus diisi"),
    pickupAddress: z
      .string()
      .min(10, "Alamat penjemputan minimal 10 karakter")
      .max(500, "Alamat maksimal 500 karakter"),
    contactPhone: z
      .string()
      .min(10, "Nomor telepon minimal 10 digit")
      .max(20, "Nomor telepon maksimal 20 karakter"),
    expectedRetrievalDate: z.string().optional(),
    entrustedItems: z
      .array(entrustedItemSchema)
      .min(1, "Harus ada minimal satu barang yang dititipkan"),
  })
  .refine(
    (data) => {
      // If allowChecks is true, monitoringFrequency should be provided
      if (data.allowChecks && !data.monitoringFrequency) {
        return false;
      }
      return true;
    },
    {
      message: "Pilih frekuensi monitoring jika mengizinkan pemeriksaan barang",
      path: ["monitoringFrequency"],
    }
  );

type EntrustmentOrderFormData = z.infer<typeof entrustmentOrderSchema>;

export default function NewEntrustmentOrderPage() {
  const { token, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<EntrustmentOrderFormData>({
    resolver: zodResolver(entrustmentOrderSchema),
    defaultValues: {
      allowChecks: true,
      monitoringFrequency: MonitoringFrequency.NONE,
      entrustedItems: [
        {
          name: "",
          description: "",
          category: "",
          estimatedValue: undefined,
          itemCondition: "",
          quantity: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entrustedItems",
  });

  const allowChecks = watch("allowChecks");

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login?message=Silakan login untuk menitipkan barang");
    }
  }, [authIsLoading, isAuthenticated, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setServerError("Ukuran file gambar tidak boleh melebihi 5MB.");
        setPackageImage(null);
        setImagePreview(null);
        if (event.target) event.target.value = "";
        return;
      }
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setServerError("Tipe file gambar hanya boleh PNG, JPG, atau WEBP.");
        setPackageImage(null);
        setImagePreview(null);
        if (event.target) event.target.value = "";
        return;
      }
      setPackageImage(file);
      setImagePreview(URL.createObjectURL(file));
      setServerError(null);
    } else {
      setPackageImage(null);
      setImagePreview(null);
    }
  };

  const addItem = () => {
    append({
      name: "",
      description: "",
      category: "",
      estimatedValue: undefined,
      itemCondition: "",
      quantity: 1,
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit: SubmitHandler<EntrustmentOrderFormData> = async (data) => {
    if (!token) {
      setServerError("Autentikasi gagal. Silakan login kembali.");
      return;
    }
    setIsSubmitting(true);
    setServerError(null);

    try {
      const formData = new FormData();

      // Add main order data
      formData.append("allowChecks", data.allowChecks.toString());
      formData.append(
        "monitoringFrequency",
        data.allowChecks
          ? data.monitoringFrequency || MonitoringFrequency.NONE
          : MonitoringFrequency.NONE
      );
      formData.append("pickupRequestedDate", data.pickupRequestedDate);
      formData.append("pickupAddress", data.pickupAddress);
      formData.append("contactPhone", data.contactPhone);

      if (data.expectedRetrievalDate) {
        formData.append("expectedRetrievalDate", data.expectedRetrievalDate);
      }

      // Add items data as JSON string
      formData.append("entrustedItems", JSON.stringify(data.entrustedItems));

      // Add package image if exists
      if (packageImage) {
        formData.append("image", packageImage); // Backend expects 'image' field name
      }

      await apiClient.createEntrustmentOrder(formData);
      alert("Order penitipan berhasil dibuat!");
      reset();
      setImagePreview(null);
      setPackageImage(null);
      const fileInput = document.getElementById(
        "packageImageInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      router.push("/dashboard/my-items");
    } catch (error: any) {
      console.error("Error creating entrustment order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat order penitipan. Silakan coba lagi.";
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Mengalihkan ke halaman login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl">
          <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
            <PackagePlus size={28} className="text-sky-400 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-400">
              Formulir Penitipan Barang
            </h1>
          </div>

          {serverError && (
            <div
              className="bg-red-500/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              <strong className="font-bold">Terjadi Kesalahan: </strong>
              <span className="block sm:inline">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Pickup Information Section */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <MapPin size={24} className="text-emerald-400 mr-2" />
                <h2 className="text-xl font-semibold text-emerald-400">
                  Informasi Penjemputan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="pickupRequestedDate"
                    className="block text-sm font-medium text-slate-300 mb-1.5"
                  >
                    Tanggal & Jam Penjemputan{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="pickupRequestedDate"
                    type="datetime-local"
                    {...register("pickupRequestedDate")}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                  {errors.pickupRequestedDate && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.pickupRequestedDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-slate-300 mb-1.5"
                  >
                    Nomor Telepon <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    {...register("contactPhone")}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-slate-500"
                    placeholder="08123456789"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.contactPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="pickupAddress"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Alamat Penjemputan <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="pickupAddress"
                  {...register("pickupAddress")}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-slate-500"
                  placeholder="Alamat lengkap untuk penjemputan barang"
                />
                {errors.pickupAddress && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.pickupAddress.message}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label
                  htmlFor="expectedRetrievalDate"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Perkiraan Tanggal Pengambilan{" "}
                  <span className="text-xs text-slate-400">(Opsional)</span>
                </label>
                <input
                  id="expectedRetrievalDate"
                  type="date"
                  {...register("expectedRetrievalDate")}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                {errors.expectedRetrievalDate && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.expectedRetrievalDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Monitoring Preferences Section */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Clock size={24} className="text-purple-400 mr-2" />
                <h2 className="text-sm md:text-xl font-semibold text-purple-400">
                  Preferensi Monitoring
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="allowChecks"
                    type="checkbox"
                    {...register("allowChecks")}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700"
                  />
                  <label
                    htmlFor="allowChecks"
                    className="ml-3 text-sm text-slate-300"
                  >
                    Izinkan kami memeriksa kondisi barang secara berkala
                  </label>
                </div>

                {allowChecks && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Frekuensi Monitoring{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {Object.values(MonitoringFrequency).map((freq) => (
                        <div key={freq} className="flex items-center">
                          <input
                            id={`monitoring-${freq}`}
                            type="radio"
                            value={freq}
                            {...register("monitoringFrequency")}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 bg-slate-700"
                          />
                          <label
                            htmlFor={`monitoring-${freq}`}
                            className="ml-3 text-sm text-slate-300"
                          >
                            {freq === "none" && "Tidak perlu monitoring"}
                            {freq === "weekly_once" && "1 kali seminggu"}
                            {freq === "weekly_twice" && "2 kali seminggu"}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.monitoringFrequency && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {errors.monitoringFrequency.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-slate-700/30 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <PackagePlus size={24} className="text-sky-400 mr-2" />
                  <h2 className="text-sm md:text-xl font-semibold text-sky-400">
                    Daftar Barang yang Dititipkan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 text-sm bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  <Plus size={16} className="mr-0 md:mr-1" />
                  <span className="hidden md:block">Tambah Barang</span>
                </button>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-slate-600/30 p-4 rounded-lg z-10"
                  >
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <h3 className="text-lg font-medium text-slate-200 mb-4">
                      Barang {index + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Nama Barang <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          {...register(`entrustedItems.${index}.name`)}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"
                          placeholder="Nama barang"
                        />
                        {errors.entrustedItems?.[index]?.name && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.entrustedItems[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Kategori
                        </label>
                        <input
                          type="text"
                          {...register(`entrustedItems.${index}.category`)}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"
                          placeholder="Elektronik, Dokumen, dll"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Deskripsi
                        </label>
                        <textarea
                          {...register(`entrustedItems.${index}.description`)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"
                          placeholder="Deskripsi detail barang"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Kondisi Barang
                        </label>
                        <input
                          type="text"
                          {...register(`entrustedItems.${index}.itemCondition`)}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"
                          placeholder="Baru, Bekas, dll"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.entrustedItems?.root && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.entrustedItems.root.message}
                </p>
              )}
            </div>

            {/* Package Image Section */}
            <div>
              <label
                htmlFor="packageImageInput"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Foto Paket/Box Keseluruhan{" "}
                <span className="text-xs text-slate-400">
                  (Opsional, maks. 5MB)
                </span>
              </label>
              <div className="mt-1 flex flex-col items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-sky-500 transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pratinjau Gambar Paket"
                    className="mx-auto h-36 w-auto rounded-md object-contain mb-3"
                  />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-500 mb-2" />
                )}
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-slate-400 justify-center">
                    <label
                      htmlFor="packageImageInput"
                      className="cursor-pointer rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-sky-500 px-1"
                    >
                      <span>Unggah file</span>
                      <input
                        id="packageImageInput"
                        name="packageImage"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/webp"
                      />
                    </label>
                    <p className="pl-1 hidden sm:inline">
                      atau tarik dan lepas
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WEBP hingga 5MB
                  </p>
                </div>
              </div>
              {packageImage && (
                <p className="text-slate-400 text-xs mt-1.5">
                  File terpilih: {packageImage.name} (
                  {(packageImage.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || authIsLoading}
                className="w-full flex justify-center items-center px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  "Buat Order Penitipan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
