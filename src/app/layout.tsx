import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { ToastProvider } from "@/components/toast";
import { Splash } from "@/components/splash-screen";

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
    <html lang="id" className="light" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Splash>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </Splash>
      </body>
    </html>
  );
}
