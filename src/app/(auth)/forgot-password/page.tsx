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
import { Loader2, Mail, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { generateResetLink } from "@/app/actions/reset-link";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetLink("");

    const result = await generateResetLink(email);

    if (!result.success) {
      setError(result.error || "Gagal generate link");
      setLoading(false);
      return;
    }

    setResetLink(result.link || "");
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{t("auth.forgotPassword")}</CardTitle>
        <CardDescription>
          Masukkan email untuk generate link reset password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetLink ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-center dark:bg-green-900/20">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Link reset password berhasil dibuat!
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reset Link (klik untuk reset password):</Label>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => window.open(resetLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka Link Reset
                </Button>
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Tersalin!" : "Copy"}
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">{t("common.back")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Reset Link
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
        {t("auth.rememberPassword")}{" "}
        <Link href="/login" className="text-primary underline hover:text-primary/80">
          {t("auth.login")}
        </Link>
      </div>
    </Card>
  );
}
