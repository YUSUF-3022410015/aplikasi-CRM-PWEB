"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast";
import { useLanguage } from "@/components/language-provider";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function NewFollowUpPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("customers").select("id, name").is("deleted_at", null).order("name").then(({ data }) => {
      setCustomers(data || []);
    });
  }, [supabase]);

  const handleSave = async () => {
    if (!customerId || !dueDate) return;
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today) {
      setError(t("followups.pastDateError"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: saveError } = await supabase.from("followups").insert({
        customer_id: customerId,
        assigned_to: user?.id || null,
        note: note.trim(),
        due_date: dueDate,
        status: "pending",
      });
      if (saveError) {
        setError(saveError.message);
        setSaving(false);
        return;
      }
      if (user) {
        const custName = customers.find((c) => c.id === customerId)?.name || "";
        Promise.resolve(supabase.from("notifications").insert({
          user_id: user.id,
          title: "Follow-up Baru",
          message: `Follow-up untuk ${custName} dijadwalkan pada ${dueDate}`,
          type: "followup_reminder",
          link: "/followups",
        })).catch(() => {});
      }
      toast(t("common.saved"), "success");
      router.push("/followups");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat menyimpan data");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("followups.addFollowup")}</h1>
          <p className="text-slate-500">Buat jadwal tindak lanjut baru</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("followups.customer")} *</Label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex h-9 w-full items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("customers.title")}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("followups.dueDate")} *</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("followups.note")}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("followups.notePlaceholder")} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>{t("common.cancel")}</Button>
        <Button onClick={handleSave} disabled={saving || !customerId || !dueDate}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
