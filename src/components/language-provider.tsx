"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import { type Locale, t as translateFn, tArray as translateArrayFn } from "@/lib/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  setLocale: () => {},
  t: (key: string) => key,
  tArray: () => [],
});

const LOCALE_EVENT = "locale-change";

// Baca locale dari localStorage sebagai external store. Dipakai
// useSyncExternalStore supaya server & klien konsisten ("id" saat pertama),
// lalu nilai tersimpan ikut terbaca tanpa setState di dalam effect.
function subscribe(callback: () => void) {
  window.addEventListener(LOCALE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOCALE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem("locale");
    return stored === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

function getServerSnapshot(): Locale {
  return "id";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem("locale", newLocale);
    } catch {}
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const t = useCallback((key: string) => translateFn(key, locale), [locale]);
  const tArray = useCallback((key: string) => translateArrayFn(key, locale), [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
