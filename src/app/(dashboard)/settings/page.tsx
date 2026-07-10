"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Loader2, Upload, Building, Globe, Mail } from "lucide-react";
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
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground shadow-sm">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t("common.save")}
        </Button>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="company" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Building className="h-4 w-4" />
            {t("settings.companyProfile")}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4" />
            {t("settings.general")}
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Mail className="h-4 w-4" />
            {t("settings.emailTemplate")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t("settings.companyProfile")}
              </CardTitle>
              <CardDescription>{t("settings.companyProfile")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>{t("settings.logo")}</Label>
                <div className="flex items-center gap-4">
                  {values.logo_url && (
                    <img
                      src={values.logo_url}
                      alt="Logo"
                      className="h-16 w-16 object-contain border rounded"
                    />
                  )}
                  <Input
                    value={values.logo_url || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="URL logo"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("settings.companyName")}</Label>
                  <Input value={values.company_name || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_name: e.target.value }))} placeholder={t("settings.companyName")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.companyEmail")}</Label>
                  <Input value={values.company_email || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_email: e.target.value }))} placeholder="info@perusahaan.com" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.companyPhone")}</Label>
                  <Input value={values.company_phone || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_phone: e.target.value }))} placeholder="021-xxxx" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.companyWebsite")}</Label>
                  <Input value={values.company_website || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_website: e.target.value }))} placeholder="https://perusahaan.com" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("settings.companyAddress")}</Label>
                  <Input value={values.company_address || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_address: e.target.value }))} placeholder={t("settings.companyAddress")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.companyCity")}</Label>
                  <Input value={values.company_city || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_city: e.target.value }))} placeholder={t("settings.companyCity")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.companyCountry")}</Label>
                  <Input value={values.company_country || ""} onChange={(e) => setValues((prev) => ({ ...prev, company_country: e.target.value }))} placeholder={t("settings.companyCountry")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.general")}
              </CardTitle>
              <CardDescription>{t("settings.currency")} & {t("settings.timezone")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("settings.currency")}</Label>
                  <Select
                    value={values.currency || "IDR"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, currency: v }))}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>{t("settings.timezone")}</Label>
                  <Select
                    value={values.timezone || "Asia/Jakarta"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, timezone: v }))}
                  >
                    <SelectTrigger>
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

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("settings.emailTemplate")}
              </CardTitle>
              <CardDescription>{t("settings.emailTemplate")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailTemplateKeys.map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label>{t(s.labelKey)}</Label>
                  {s.key.includes("body") ? (
                    <Textarea
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                      rows={4}
                    />
                  ) : (
                    <Input
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
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
