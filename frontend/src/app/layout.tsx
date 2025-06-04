// src/app/layout.tsx
import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; // Impor AuthProvider

const redHatDisplay = Red_Hat_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keepify App",
  description: "Aplikasi Penitipan Barang Keepify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={redHatDisplay.className}>
        <AuthProvider>
          {" "}
          {/* Bungkus dengan AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
