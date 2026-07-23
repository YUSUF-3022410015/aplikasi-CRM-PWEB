"use client";

import { useState } from "react";
import "./login.css";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrorsMap: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrorsMap[field] = err.message;
      });
      setFieldErrors(fieldErrorsMap);
      return;
    }

    setLoading(true);

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
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/15 p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white text-3xl font-bold shadow-lg mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nexus CRM</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Customer Relationship Management</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t("auth.login")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("auth.welcome")}</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 leading-relaxed animate-scale-in">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              {t("auth.email")}
            </label>
            <div className="relative group">
              <div className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${fieldErrors.email ? "text-red-400" : "text-gray-400 group-focus-within:text-primary"}`}>
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                className={`pl-10 h-11 text-sm bg-gray-50 transition-all rounded-xl ${
                  fieldErrors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
                autoComplete="email"
                required
              />
              {fieldErrors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                {t("auth.password")}
              </label>
            </div>
            <div className="relative group">
              <div className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${fieldErrors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-primary"}`}>
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                className={`pl-10 pr-12 h-11 text-sm bg-gray-50 transition-all rounded-xl ${
                  fieldErrors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {fieldErrors.password && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                {t("auth.login")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-white/40 mt-8 font-medium">
        &copy; {new Date().getFullYear()} Nexus CRM. All rights reserved.
      </p>
    </div>
  );
}
