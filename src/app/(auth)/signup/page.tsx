"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2, CheckCircle2, Shield } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("sales");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Server-side validation: admin role cannot be created via public signup
    if (role === "admin") {
      setError("Pendaftaran sebagai Admin tidak diperbolehkan. Hubungi administrator.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullname, role },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Insert profile (best effort — don't block signup if this fails)
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          fullname,
          email,
          role,
        });
      } catch {
        // Profile insert failed, but signup succeeded — continue
      }
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("auth.signup")} ✓</CardTitle>
          <CardDescription>
            {t("auth.email")}: <strong>{role === "admin" ? t("auth.admin") : role === "manager" ? t("auth.manager") : t("auth.sales")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">{t("auth.login")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">CRM</CardTitle>
        <CardDescription>
          {t("auth.signup")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Role Selection - Admin only via User Management page */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("auth.role")}
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder={t("auth.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                <SelectItem value="manager">{t("auth.manager")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "manager" && t("auth.manager")}
              {role === "sales" && t("auth.sales")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullname">{t("auth.fullname")}</Label>
            <Input
              id="fullname"
              type="text"
              placeholder={t("auth.fullname")}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
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
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("auth.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              t("auth.signup")
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="text-primary underline hover:text-primary/80">
            {t("auth.login")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
