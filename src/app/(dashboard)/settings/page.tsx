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

const settingKeys = [
  { key: "company_name", label: "Nama Perusahaan", placeholder: "PT. Nama Perusahaan" },
  { key: "company_email", label: "Email Perusahaan", placeholder: "info@perusahaan.com" },
  { key: "company_phone", label: "Telepon", placeholder: "021-xxxx" },
  { key: "company_website", label: "Website", placeholder: "https://perusahaan.com" },
  { key: "company_address", label: "Alamat", placeholder: "Alamat lengkap" },
  { key: "company_city", label: "Kota", placeholder: "Jakarta" },
  { key: "company_country", label: "Negara", placeholder: "Indonesia" },
  { key: "currency", label: "Mata Uang", placeholder: "IDR" },
  { key: "timezone", label: "Timezone", placeholder: "Asia/Jakarta" },
  { key: "logo_url", label: "Logo URL", placeholder: "https://example.com/logo.png" },
];

const emailTemplateKeys = [
  { key: "email_quotation_subject", label: "Subject Quotation", placeholder: "Penawaran Harga {number}" },
  { key: "email_quotation_body", label: "Template Body Quotation", placeholder: "Halo {customer},\n\nBerikut penawaran harga..." },
  { key: "email_followup_subject", label: "Subject Follow-up", placeholder: "Pengingat Follow-up: {customer}" },
  { key: "email_followup_body", label: "Template Body Follow-up", placeholder: "Halo,\n\nIni adalah pengingat untuk follow-up..." },
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
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Memuat pengaturan...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Pengaturan aplikasi dan profil perusahaan</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan
        </Button>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Pengaturan Umum
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Profile
              </CardTitle>
              <CardDescription>Informasi dasar perusahaan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo Perusahaan</Label>
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
                    placeholder="URL logo perusahaan"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {settingKeys.slice(0, 4).map((s) => (
                  <div key={s.key} className="space-y-2">
                    <Label>{s.label}</Label>
                    <Input
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {settingKeys.slice(4, 7).map((s) => (
                  <div key={s.key} className="space-y-2">
                    <Label>{s.label}</Label>
                    <Input
                      value={values[s.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Pengaturan Umum
              </CardTitle>
              <CardDescription>Konfigurasi mata uang dan zona waktu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mata Uang</Label>
                  <Select
                    value={values.currency || "IDR"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata uang" />
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
                  <Label>Timezone</Label>
                  <Select
                    value={values.timezone || "Asia/Jakarta"}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, timezone: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih timezone" />
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
                Email Template
              </CardTitle>
              <CardDescription>Template email untuk quotation dan follow-up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailTemplateKeys.map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label>{s.label}</Label>
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
                    Gunakan {"{customer}"}, {"{number}"}, {"{total}"} sebagai variabel
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
