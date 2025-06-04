"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Menu, Shield } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen bg-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Sidebar dengan sticky positioning */}
      <div className="sticky top-0 h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                id="menu-button"
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors mr-3 text-slate-300 hover:text-white"
                aria-label="Toggle sidebar"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center">
                <Shield size={24} className="text-sky-400 mr-2" />
                <h1 className="text-lg font-bold text-sky-400">Keepify</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
