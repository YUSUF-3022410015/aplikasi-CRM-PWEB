"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Loader2 } from "lucide-react";

const settingKeys = [
  { key: "company_name", label: "Nama Perusahaan", placeholder: "PT. Nama Perusahaan" },
  { key: "company_email", label: "Email Perusahaan", placeholder: "info@perusahaan.com" },
  { key: "company_phone", label: "Telepon", placeholder: "021-xxxx" },
  { key: "company_website", label: "Website", placeholder: "https://perusahaan.com" },
  { key: "company_address", label: "Alamat", placeholder: "Alamat lengkap" },
  { key: "currency", label: "Mata Uang", placeholder: "IDR" },
  { key: "timezone", label: "Timezone", placeholder: "Asia/Jakarta" },
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

    const toInsert: { key: string; value: string }[] = [];
    const toUpdate: Promise<unknown>[] = [];

    for (const s of settingKeys) {
      const val = values[s.key] || "";
      if (existingKeys.has(s.key)) {
        toUpdate.push(supabase.from("settings").update({ value: val }).eq("key", s.key));
      } else {
        toInsert.push({ key: s.key, value: val });
      }
    }

    if (toInsert.length > 0) {
      await supabase.from("settings").insert(toInsert);
    }
    await Promise.all(toUpdate);
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
          <div className="space-y-2">
            <Label>{settingKeys[4].label}</Label>
            <Input
              value={values[settingKeys[4].key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [settingKeys[4].key]: e.target.value }))}
              placeholder={settingKeys[4].placeholder}
            />
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
            {settingKeys.slice(5).map((s) => (
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
    </div>
  );
}
