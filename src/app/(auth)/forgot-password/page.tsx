"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2, CheckCircle, Eye, EyeOff, Mail, Lock, KeyRound } from "lucide-react";
import { resetPasswordByEmail } from "@/app/actions/reset-password";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    const result = await resetPasswordByEmail(email, newPassword);

    if (!result.success) {
      setError(result.error || "Gagal reset password");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <Card className="w-full border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center pb-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 animate-scale-in">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold animate-slide-up" style={{ animationDelay: "0.1s" }}>Lupa Password?</CardTitle>
        <CardDescription className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          Masukkan email dan password baru untuk reset
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Password berhasil diubah! Mengalihkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-slide-down">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  className="pl-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <Label htmlFor="newPassword" className="text-sm font-medium">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru (min 6 karakter)"
                  className="pl-10 pr-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-xs text-destructive">Password minimal 6 karakter</p>
              )}
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button type="submit" className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" disabled={loading || newPassword.length < 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <div className="px-6 pb-6 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "0.35s" }}>
        Ingat password?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
          {t("auth.login")}
        </Link>
      </div>
    </Card>
  );
}
