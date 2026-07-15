"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Save, Loader2, Building, Globe, Mail, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/language-provider";

const settingKeys = [
  { key: "company_name", labelKey: "settings.companyName", placeholder: "PT. Nama Perusahaan" },
  { key: "company_email", labelKey: "settings.companyEmail", placeholder: "info@perusahaan.com" },
  { key: "company_phone", labelKey: "settings.companyPhone", placeholder: "021-xxxx" },
  { key: "company_website", labelKey: "settings.companyWebsite", placeholder: "https://perusahaan.com" },
  { key: "company_address", labelKey: "settings.companyAddress", placeholder: "Alamat lengkap" },
  { key: "company_city", labelKey: "settings.companyCity", placeholder: "Jakarta" },
  { key: "company_country", labelKey: "settings.companyCountry", placeholder: "Indonesia" },
  { key: "currency", labelKey: "settings.currency", placeholder: "IDR" },
  { key: "timezone", labelKey: "settings.timezone", placeholder: "Asia/Jakarta" },
  { key: "logo_url", labelKey: "settings.logo", placeholder: "https://example.com/logo.png" },
];

const emailTemplateKeys = [
  { key: "email_quotation_subject", labelKey: "quotations.title", placeholder: "Penawaran Harga {number}" },
  { key: "email_quotation_body", labelKey: "quotations.notes", placeholder: "Halo {customer},\n\nBerikut penawaran harga..." },
  { key: "email_followup_subject", labelKey: "followups.title", placeholder: "Pengingat Follow-up: {customer}" },
  { key: "email_followup_body", labelKey: "followups.note", placeholder: "Halo,\n\nIni adalah pengingat untuk follow-up..." },
];

const timezones = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
];

const currencies = [
  { value: "IDR", label: "IDR - Rupiah Indonesia" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { t } = useLanguage();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value; });
      setValues(map);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("settings").select("key");
    const existingKeys = new Set((existing || []).map((s) => s.key));

    for (const s of settingKeys) {
      const val = values[s.key] || "";
      if (existingKeys.has(s.key)) {
        await supabase.from("settings").update({ value: val }).eq("key", s.key);
      }
    }

    const toInsert = settingKeys
      .filter((s) => !existingKeys.has(s.key))
      .map((s) => ({ key: s.key, value: values[s.key] || "" }));

    if (toInsert.length > 0) {
      await supabase.from("settings").insert(toInsert);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse-soft" />
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse-soft" />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse-soft" />
              <div className="h-10 w-full bg-muted rounded-md animate-pulse-soft" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-shadow">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t("common.save")}
        </Button>
      </div>

      <Tabs defaultValue="company" className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="company" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.companyProfile")}</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.emailTemplate")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card className="border-border/50 shadow-sm animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                {t("settings.companyProfile")}
              </CardTitle>
              <CardDescription>{t("settings.companyProfile")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.05s" }}>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  {t("settings.logo")}
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {values.logo_url && (
                    <img
                      src={values.logo_url}
                      alt="Logo"
                      className="h-16 w-16 object-contain border rounded-lg shadow-sm"
                    />
                  )}
                  <Input
                    value={values.logo_url || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="URL logo"
                    className="flex-1 border-border/60 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyName")}</Label>
                  <Input value={values.company_name || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_name: e.target.value }))} placeholder="PT. Nama Perusahaan" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.15s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyEmail")}</Label>
                  <Input value={values.company_email || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_email: e.target.value }))} placeholder="info@perusahaan.com" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyPhone")}</Label>
                  <Input value={values.company_phone || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_phone: e.target.value }))} placeholder="021-xxxx" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyWebsite")}</Label>
                  <Input value={values.company_website || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_website: e.target.value }))} placeholder="https://perusahaan.com" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyAddress")}</Label>
                  <Input value={values.company_address || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_address: e.target.value }))} placeholder="Alamat lengkap" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.35s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyCity")}</Label>
                  <Input value={values.company_city || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_city: e.target.value }))} placeholder="Jakarta" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <Label className="text-sm font-medium">{t("settings.companyCountry")}</Label>
                  <Input value={values.company_country || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_country: e.target.value }))} placeholder="Indonesia" className="border-border/60 bg-background/50 focus:bg-background transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="border-border/50 shadow-sm animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                {t("settings.general")}
              </CardTitle>
              <CardDescription>{t("settings.currency")} & {t("settings.timezone")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.05s" }}>
                  <Label className="text-sm font-medium">{t("settings.currency")}</Label>
                  <Select
                    value={values.currency || "IDR"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, currency: v }))}
                  >
                    <SelectTrigger className="border-border/60 bg-background/50">
                      <SelectValue placeholder="IDR" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <Label className="text-sm font-medium">{t("settings.timezone")}</Label>
                  <Select
                    value={values.timezone || "Asia/Jakarta"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, timezone: v }))}
                  >
                    <SelectTrigger className="border-border/60 bg-background/50">
                      <SelectValue placeholder="Asia/Jakarta" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Template Tab */}
        <TabsContent value="email">
          <Card className="border-border/50 shadow-sm animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                {t("settings.emailTemplate")}
              </CardTitle>
              <CardDescription>{t("settings.emailTemplate")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailTemplateKeys.map((s, i) => (
                <div key={s.key} className="space-y-2 animate-slide-up" style={{ animationDelay: `${0.05 * (i + 1)}s` }}>
                  <Label className="text-sm font-medium">{t(s.labelKey)}</Label>
                  {s.key.includes("body") ? (
                    <Textarea
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                      rows={4}
                      className="border-border/60 bg-background/50 focus:bg-background transition-colors"
                    />
                  ) : (
                    <Input
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                      className="border-border/60 bg-background/50 focus:bg-background transition-colors"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {"{customer}"}, {"{number}"}, {"{total}"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
