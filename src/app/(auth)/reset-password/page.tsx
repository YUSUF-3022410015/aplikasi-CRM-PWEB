"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Loader2, Eye, EyeOff, CheckCircle, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase reset password sends tokens in URL hash fragment
    // We need to listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setValidToken(true);
      }
    });

    // Also check for hash tokens (initial page load from email link)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setValidToken(true);
    } else if (hash && hash.includes("access_token")) {
      setValidToken(true);
    } else {
      // No valid token found
      setValidToken(false);
    }

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.updateUser({
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (validToken === null) {
    return (
      <Card className="w-full border-border/50 shadow-xl shadow-primary/5 animate-scale-in">
        <CardContent className="py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">{t("common.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (validToken === false) {
    return (
      <Card className="w-full border-border/50 shadow-xl shadow-primary/5 animate-scale-in">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 animate-scale-in">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold animate-slide-up">{t("auth.invalidLink")}</CardTitle>
          <CardDescription className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {t("auth.invalidLinkDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button asChild className="shadow-lg shadow-primary/25">
            <Link href="/forgot-password">{t("common.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center pb-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 animate-scale-in">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold animate-slide-up" style={{ animationDelay: "0.1s" }}>{t("auth.resetPassword")}</CardTitle>
        <CardDescription className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          {t("auth.resetPasswordDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("auth.passwordChangedRedirect")}
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

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.confirmPassword")}
                  className="pl-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button type="submit" className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("auth.resetPassword")
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
