import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Manajemen Pelanggan",
  description: "Sistem manajemen pelanggan untuk mengelola data, aktivitas, dan penjualan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
