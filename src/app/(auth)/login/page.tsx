"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const { t, locale, setLocale } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-white text-2xl font-bold shadow-xl ring-1 ring-white/20 mb-5">
          N
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Nexus CRM</h1>
        <p className="text-white/50 text-sm mt-1.5">Customer Relationship Management</p>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-gray-900">{t("auth.login")}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Selamat datang kembali</p>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-gray-400 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
          >
            {locale === "id" ? "EN" : "ID"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                className="pl-10 h-11 text-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                className="pl-10 pr-12 h-11 text-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium shadow-sm shadow-primary/20" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              t("auth.login")
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-white/40 mt-8">
        &copy; {new Date().getFullYear()} Nexus CRM
      </p>
    </div>
  );
}
