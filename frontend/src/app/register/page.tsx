// src/app/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Digunakan di App Router
import { apiClient } from '@/lib/api'; // Sesuaikan path jika perlu
import { useState } from 'react';

// Skema validasi menggunakan Zod, sesuaikan dengan RegisterUserDto di backend Anda
// dan User entity [cite: 4, 27, 28, 29]
const registerSchema = z.object({
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
  lastName: z.string().min(2, 'Nama belakang minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter')
    .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'Password harus mengandung huruf besar, huruf kecil, dan angka/simbol'),
  phone: z.string().optional().or(z.literal('')), // Opsional, bisa string kosong
  address: z.string().optional().or(z.literal('')), // Opsional, bisa string kosong
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { // Set nilai default untuk field opsional agar terkontrol
        phone: '',
        address: '',
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    // Siapkan data untuk dikirim, hapus field opsional jika kosong
    const payload: any = { ...data };
    if (!payload.phone) delete payload.phone;
    if (!payload.address) delete payload.address;
    
    try {
      // Panggil apiClient.register yang sudah Anda definisikan [cite: 60]
      const response = await apiClient.register(payload); 
      console.log('Registrasi berhasil:', response);
      // Arahkan ke halaman login dengan pesan sukses
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Error registrasi:', error);
      const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      // Jika backend mengembalikan array error (misalnya dari class-validator)
      if (Array.isArray(errorMessage)) {
        setServerError(errorMessage.join(', '));
      } else {
        setServerError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg"> {/* Diperlebar sedikit untuk form yang lebih panjang */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-sky-400 mb-6 sm:mb-8">
          Buat Akun Keepify
        </h1>
        {serverError && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"> {/* Sedikit penyesuaian space */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
              >
                Nama Depan
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
              >
                Nama Belakang
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
              placeholder="anda@email.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          
          <div>
            <label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
            >
              Nomor Telepon <span className="text-slate-500">(Opsional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
              placeholder="0812xxxxxxx"
            />
            {errors.phone && ( // Seharusnya tidak sering muncul karena opsional dan bisa string kosong
              <p className="text-red-400 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-1"
            >
              Alamat <span className="text-slate-500">(Opsional)</span>
            </label>
            <textarea // Menggunakan textarea untuk alamat agar lebih leluasa
              id="address"
              rows={3}
              {...register('address')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
              placeholder="Jalan Contoh No. 123, Kota Anda"
            />
            {errors.address && ( // Seharusnya tidak sering muncul
              <p className="text-red-400 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 focus:ring-4 focus:ring-sky-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Mendaftar...' : 'Daftar Akun'}
            </button>
          </div>
        </form>
        <p className="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}