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
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Lupa Password?</CardTitle>
        <CardDescription>
          Masukkan email dan password baru untuk reset
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <p className="text-sm text-muted-foreground">
              Password berhasil diubah! Mengalihkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru (min 6 karakter)"
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
            <Button type="submit" className="w-full" disabled={loading || newPassword.length < 6}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
        Ingat password?{" "}
        <Link href="/login" className="text-primary underline hover:text-primary/80">
          {t("auth.login")}
        </Link>
      </div>
    </Card>
  );
}
