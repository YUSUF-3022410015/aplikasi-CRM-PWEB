"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Mail, Lock, Languages } from "lucide-react";
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
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#111827]">{t("auth.login")}</h1>
          <p className="text-sm text-[#6b7280] mt-1">Selamat datang kembali</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[#6b7280] hover:text-[#111827] px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setLocale(locale === "id" ? "en" : "id")}
        >
          <Languages className="h-3.5 w-3.5 inline mr-1" />
          {locale === "id" ? "EN" : "ID"}
        </button>
      </div>

      <Card className="w-full border border-gray-200 shadow-sm rounded-xl bg-white">
        <CardHeader className="pb-4 pt-5 px-5">
          <CardTitle className="text-sm font-medium text-[#374151]">Masuk ke akun Anda</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  className="pl-9 h-10 text-sm bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="pl-9 pr-10 h-10 text-sm bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] p-1 rounded-md hover:bg-gray-100 transition-colors"
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

            <Button
              type="submit"
              className="w-full h-10 rounded-lg text-sm font-medium shadow-sm"
              disabled={loading}
            >
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
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#9ca3af] mt-8">
        &copy; {new Date().getFullYear()} Nexus CRM
      </p>
    </>
  );
}
