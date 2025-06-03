// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api'; // Pastikan path ini benar
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk data pengguna (sesuaikan dengan yang dikembalikan API Anda)
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // tambahkan field lain jika ada dari API
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Untuk menangani state loading saat cek token awal
  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Default true saat aplikasi pertama dimuat
  const router = useRouter();

  useEffect(() => {
    const loadUserFromToken = async () => {
      console.log('AuthContext Effect: Attempting to load user from token...');
      const storedToken = localStorage.getItem('keepify_token');
      if (storedToken) {
        console.log('AuthContext Effect: Token found in localStorage:', storedToken);
        setToken(storedToken);
        try {
          const profileResponse = await apiClient.getProfile();
          console.log('AuthContext Effect: Profile loaded:', profileResponse);
          setUser(profileResponse.user || profileResponse);
        } catch (error) {
          console.error("AuthContext Effect: Failed to load user from token, removing token.", error);
          localStorage.removeItem('keepify_token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('AuthContext Effect: No token found in localStorage.');
      }
      setIsLoading(false);
      console.log('AuthContext Effect: Finished loading, isLoading set to false.');
    };
    loadUserFromToken();
  }, []);

  const loginAction = async (email: string, password: string) => {
    try {
      setIsLoading(true); // Set loading true di awal
      console.log('[AuthContext] loginAction: Started');
      const response = await apiClient.login(email, password);
      console.log('[AuthContext] loginAction: API response received', response);

      if (response && response.access_token && response.user) {
        localStorage.setItem('keepify_token', response.access_token);
        console.log('[AuthContext] loginAction: Token saved to localStorage');
        setToken(response.access_token);
        console.log('[AuthContext] loginAction: Token set in state');
        setUser(response.user);
        console.log('[AuthContext] loginAction: User set in state', response.user);
        setIsLoading(false); // Pastikan ini dipanggil SEBELUM redirect
        console.log('[AuthContext] loginAction: isLoading set to false. Attempting redirect...');
        router.push('/dashboard');
        console.log('[AuthContext] loginAction: Redirect to /dashboard initiated.');
      } else {
        console.error('[AuthContext] loginAction: Invalid API response structure', response);
        setIsLoading(false);
        throw new Error('Format respons login tidak valid dari server.');
      }
    } catch (error) {
      console.error('[AuthContext] loginAction: Error caught', error);
      setIsLoading(false); // Pastikan isLoading false juga di sini
      throw error;
    }
  };


  const logoutAction = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('keepify_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
        user,
        token,
        isAuthenticated: !!token && !!user, // Anggap terautentikasi jika ada token dan user
        isLoading,
        loginAction,
        logoutAction
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};