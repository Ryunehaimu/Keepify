// src/app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Pastikan path ini benar

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAction, isLoading: authIsLoading, isAuthenticated, user } = useAuth(); // Dapatkan dari context
  const [serverError, setServerError] = useState<string | null>(null);

  const registeredMessage = searchParams.get('registered') === 'true'
    ? 'Registrasi berhasil! Silakan login.'
    : null;

  // Redirect jika sudah login atau setelah login berhasil melalui context
  useEffect(() => {
    console.log('[LoginPage Effect] Fired. isAuthenticated:', isAuthenticated, 'authIsLoading:', authIsLoading, 'user:', user);
    if (!authIsLoading && isAuthenticated && user) { // Pastikan user juga sudah ada
      console.log('[LoginPage Effect] Conditions met. Redirecting to /dashboard.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authIsLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null); // Reset server error setiap kali submit
    console.log('[LoginPage onSubmit] Attempting login with:', data.email);
    try {
      await loginAction(data.email, data.password);
      // Pengalihan sekarang utama ditangani oleh useEffect atau di dalam loginAction itu sendiri
      // Jika loginAction berhasil, isAuthenticated akan true, dan useEffect akan redirect.
      console.log('[LoginPage onSubmit] loginAction finished.');
    } catch (error: any) {
      console.error('[LoginPage onSubmit] Error caught from loginAction:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setServerError(errorMessage);
    }
  };

  // Jika AuthContext sedang memuat data pengguna (misalnya saat refresh halaman)
  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        Memuat...
      </div>
    );
  }

  // Jika sudah terautentikasi, idealnya sudah diarahkan oleh useEffect.
  // Ini sebagai fallback atau jika ada sedikit jeda sebelum redirect.
  if (isAuthenticated) {
     // Anda bisa menampilkan null atau pesan singkat karena redirect sedang/akan terjadi.
     // Namun, karena useEffect sudah ada, ini mungkin tidak akan pernah terlihat.
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Mengalihkan ke dashboard...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-sky-400 mb-6">
          Login ke Keepify
        </h1>
        {registeredMessage && !serverError && (
          <div className="mb-4 p-3 bg-green-500/20 text-green-300 border border-green-500/30 rounded-md text-sm">
            {registeredMessage}
          </div>
        )}
        {serverError && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
              placeholder="anda@email.com"
              disabled={authIsLoading} // Nonaktifkan input saat loading
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
              placeholder="••••••••"
              disabled={authIsLoading} // Nonaktifkan input saat loading
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={authIsLoading} // Gunakan authIsLoading dari context
              className="w-full px-6 py-3 text-base font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 focus:ring-4 focus:ring-sky-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {authIsLoading ? 'Memproses...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-400 mt-8">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}