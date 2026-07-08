"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Loader2 } from "lucide-react";

interface SettingsData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website: string;
  currency: string;
  timezone: string;
}

const defaultSettings: SettingsData = {
  company_name: "",
  company_email: "",
  company_phone: "",
  company_address: "",
  company_website: "",
  currency: "IDR",
  timezone: "Asia/Jakarta",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").limit(1).single();
    if (data) {
      setSettings({
        company_name: data.company_name || "",
        company_email: data.company_email || "",
        company_phone: data.company_phone || "",
        company_address: data.company_address || "",
        company_website: data.company_website || "",
        currency: data.currency || "IDR",
        timezone: data.timezone || "Asia/Jakarta",
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("settings").select("id").limit(1).single();
    if (existing) {
      await supabase.from("settings").update(settings).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert(settings);
    }
    setSaving(false);
  };

  const update = (field: keyof SettingsData, value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Company Profile
          </CardTitle>
          <CardDescription>Informasi dasar perusahaan Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Perusahaan</Label>
              <Input value={settings.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="PT. Nama Perusahaan" />
            </div>
            <div className="space-y-2">
              <Label>Email Perusahaan</Label>
              <Input type="email" value={settings.company_email} onChange={(e) => update("company_email", e.target.value)} placeholder="info@perusahaan.com" />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input value={settings.company_phone} onChange={(e) => update("company_phone", e.target.value)} placeholder="021-xxxx" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={settings.company_website} onChange={(e) => update("company_website", e.target.value)} placeholder="https://perusahaan.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input value={settings.company_address} onChange={(e) => update("company_address", e.target.value)} placeholder="Alamat lengkap" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
          <CardDescription>Konfigurasi mata uang dan zona waktu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mata Uang</Label>
              <Input value={settings.currency} onChange={(e) => update("currency", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={settings.timezone} onChange={(e) => update("timezone", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
