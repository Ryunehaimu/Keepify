// src/components/sidebar.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    ListChecks, 
    PackagePlus, 
    LogOut, 
    UserCircle, 
    X, 
    Shield,
    Users, // <-- PERUBAHAN: Ikon baru untuk admin
    FileCog // <-- PERUBAHAN: Ikon baru untuk admin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isOpen = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutAction } = useAuth();
  
  // PERUBAHAN: Mendefinisikan menu navigasi berdasarkan peran pengguna
  const userNavItems = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/dashboard/my-items', label: 'Barang Saya', icon: ListChecks },
    { href: '/dashboard/new-item', label: 'Titip Barang', icon: PackagePlus },
  ];

  const adminNavItems = [
    { href: '/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/dashboard/manage-orders-pickup', label: 'Kelola Order Pickup', icon: FileCog },
    { href: '/dashboard/manage-orders-monitoring', label: 'Monitoring Barang', icon: FileCog },
    { href: '/dashboard/manage-users', label: 'Kelola Pengguna', icon: Users },
  ];

  // Pilih menu yang akan ditampilkan
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('menu-button');
      if (
        isOpen && 
        sidebar && 
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node) &&
        window.innerWidth < 768
      ) {
        onToggle?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (window.innerWidth < 768 && isOpen) {
      onToggle?.();
    }
  }, [pathname, isOpen, onToggle]);

  const handleLogout = async () => {
    try {
      if (logoutAction) {
        await logoutAction();
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300" />
      )}
      <aside
        id="mobile-sidebar"
        className={`
          fixed left-0 top-0 z-50 h-screen w-64 
          bg-slate-800 text-slate-100 border-r border-slate-700
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4 md:py-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center">
              <Shield size={28} className="text-sky-400 mr-2" />
              <span className="text-2xl font-bold text-sky-400 whitespace-nowrap">
                Keepify
              </span>
            </Link>
            <button
              onClick={onToggle}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    group flex items-center rounded-lg p-3 text-base font-normal transition-all duration-200
                    ${active 
                      ? 'bg-sky-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-sky-300'
                    }
                  `}
                >
                  <item.icon 
                    size={22} 
                    className={`
                      transition-all duration-200 group-hover:scale-110
                      ${active ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'}
                    `} 
                  />
                  <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
                  {active && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-slate-700">
            {user && (
              <div className="flex items-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                <UserCircle size={36} className="text-slate-400 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                   {/* PERUBAHAN: Menambahkan badge untuk Admin */}
                  {user.role === 'ADMIN' && (
                    <span className="text-xs font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                        Admin
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="
                w-full group flex items-center justify-center rounded-lg p-3 text-base font-normal 
                bg-red-600/80 text-red-100 hover:bg-red-600 hover:text-white transition-all duration-200
                hover:scale-105 active:scale-95
              "
            >
              <LogOut size={20} className="mr-2 group-hover:scale-110 transition-transform" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;