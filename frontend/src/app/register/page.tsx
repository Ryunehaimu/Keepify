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
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [otp, setOtp] = useState("");

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

  const onFormSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // 1. Request OTP
      await apiClient.sendRegisterOtp(data.email);
      // 2. Simpan data sementara dan pindah ke step OTP
      setFormData(data);
      setStep('otp');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengirim kode OTP.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || otp.length < 4) return; // Basic validation

    setIsLoading(true);
    setServerError(null);

    // Siapkan data untuk dikirim, hapus field opsional jika kosong
    const payload: any = { ...formData, otp }; // Sertakan OTP
    if (!payload.phone) delete payload.phone;
    if (!payload.address) delete payload.address;
    
    try {
      // Panggil apiClient.register (pastikan backend menerima field otp)
      const response = await apiClient.register(payload); 
      console.log('Registrasi berhasil:', response);
      // Arahkan ke halaman login dengan pesan sukses
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Error registrasi:', error);
      const errorMessage = error.response?.data?.message || 'Kode OTP salah atau kedaluwarsa.';
      
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
      <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-sky-400 mb-6 sm:mb-8">
          {step === 'form' ? 'Buat Akun Keepify' : 'Verifikasi Email'}
        </h1>
        
        {serverError && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm">
            {serverError}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Nama Depan
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Nama Belakang
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="anda@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Nomor Telepon <span className="text-slate-500">(Opsional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="0812xxxxxxx"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Alamat <span className="text-slate-500">(Opsional)</span>
              </label>
              <textarea
                id="address"
                rows={3}
                {...register('address')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-sm sm:text-base"
                placeholder="Jalan Contoh No. 123, Kota Anda"
              />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 focus:ring-4 focus:ring-sky-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Mengirim OTP...' : 'Lanjut Verifikasi Email'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-6">
             <div className="text-center">
               <p className="text-slate-300 mb-4">
                 Kami telah mengirimkan kode OTP ke email <span className="font-semibold text-white">{formData?.email}</span>.
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

             <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isLoading}
                  className="w-1/3 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 4}
                  className="w-2/3 px-6 py-3 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Verifikasi...' : 'Konfirmasi & Daftar'}
                </button>
             </div>
          </form>
        )}

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