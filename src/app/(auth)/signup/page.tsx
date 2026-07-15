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
import { Eye, EyeOff, Loader2, CheckCircle2, Shield, User, Mail, Lock } from "lucide-react";
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

    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          fullname,
          email,
          role,
        });
      } catch {
        // Profile insert failed, but signup succeeded
      }
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <Card className="w-full border-border/50 shadow-xl shadow-primary/5 animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 animate-scale-in">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("auth.signup")} ✓</CardTitle>
          <CardDescription>
            {t("auth.email")}: <strong>{role === "manager" ? t("auth.manager") : t("auth.sales")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full shadow-lg shadow-primary/25">{t("auth.login")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center pb-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 animate-scale-in">
          N
        </div>
        <CardTitle className="text-2xl font-bold animate-slide-up" style={{ animationDelay: "0.1s" }}>Nexus CRM</CardTitle>
        <CardDescription className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          {t("auth.signup")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-3">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-slide-down">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4" />
              {t("auth.role")}
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="border-border/60 bg-background/50 focus:bg-background transition-colors">
                <SelectValue placeholder={t("auth.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                <SelectItem value="manager">{t("auth.manager")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <Label htmlFor="fullname" className="text-sm font-medium">{t("auth.fullname")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullname"
                type="text"
                placeholder={t("auth.fullname")}
                className="pl-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
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

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <Label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                className="pl-10 pr-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
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

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("auth.confirmPassword")}
                className="pl-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.45s" }}>
            <Button type="submit" className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.signup")
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "0.5s" }}>
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            {t("auth.login")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
