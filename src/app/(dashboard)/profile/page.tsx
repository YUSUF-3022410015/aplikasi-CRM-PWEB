"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { Save, Loader2, User, Lock, Shield } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function ProfilePage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const { t } = useLanguage();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          setFullname(profile.fullname || "");
          setEmail(profile.email || user.email || "");
          setRole(profile.role || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ fullname })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(t("profile.profileUpdated"));
      router.refresh();
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    setChangingPassword(true);
    setError("");
    setSuccess("");

    const { error: pwError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (pwError) {
      setError(pwError.message);
    } else {
      setSuccess(t("profile.passwordChanged"));
      setNewPassword("");
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse-soft" />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse-soft" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse-soft" />
              <div className="h-3 w-48 bg-muted rounded-md animate-pulse-soft" />
            </div>
          </div>
          <div className="h-10 w-full bg-muted rounded-md animate-pulse-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("nav.profile")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.manageAccount")}</p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-slide-down">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 animate-slide-down">
          {error}
        </div>
      )}

      {/* Profile Info Card */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            {t("profile.profileInfo")}
          </CardTitle>
          <CardDescription>{t("profile.updateInfo")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <Avatar className="h-16 w-16 shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {getInitials(fullname || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{fullname || "User"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground capitalize">{t("auth.role")}: {role}</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="fullname" className="text-sm font-medium">{t("profile.fullName")}</Label>
            <Input
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder={t("profile.fullNamePlaceholder")}
              className="border-border/60 bg-background/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
            <Input id="email" value={email} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">{t("profile.emailCannotBeChanged")}</p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button onClick={handleSave} disabled={saving} className="shadow-sm hover:shadow-md transition-shadow">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            {t("profile.changePassword")}
          </CardTitle>
          <CardDescription>{t("profile.minChars")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <Label htmlFor="newPassword" className="text-sm font-medium">{t("profile.newPassword")}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("auth.password")}
              className="border-border/60 bg-background/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="shadow-sm hover:shadow-md transition-shadow">
              {changingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {t("common.changePassword")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
