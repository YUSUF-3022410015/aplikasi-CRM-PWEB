"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
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
  const { t } = useLanguage();

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
    <Card className="w-full border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center pb-2">
        {/* Logo */}
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 animate-scale-in">
          N
        </div>
        <CardTitle className="text-2xl font-bold animate-slide-up" style={{ animationDelay: "0.1s" }}>Nexus CRM</CardTitle>
        <CardDescription className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          {t("auth.login")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-slide-down">
              {error}
            </div>
          )}

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
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

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
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

          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button type="submit" className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.login")
              )}
            </Button>
          </div>

          <div className="text-center animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <Link href="/forgot-password" className="text-sm text-primary/80 hover:text-primary transition-colors">
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </form>
      </CardContent>

      <div className="px-6 pb-6 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "0.4s" }}>
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
          {t("auth.signup")}
        </Link>
      </div>
    </Card>
  );
}
