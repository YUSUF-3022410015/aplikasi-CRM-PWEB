"use client";

import { useState, useEffect } from "react";

export function Splash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div className="splash-screen fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#1e40af]">
          <div className="text-center">
            <div className="text-pop-up-top inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md text-white text-5xl font-bold shadow-2xl ring-1 ring-white/25">
              N
            </div>
            <p className="text-pop-up-top mt-6 text-white/80 text-sm font-medium tracking-widest uppercase" style={{ animationDelay: "0.2s" }}>
              Nexus CRM
            </p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
