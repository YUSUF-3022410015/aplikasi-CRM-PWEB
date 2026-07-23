"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function AddActivityForm({ customerId }: { customerId: string }) {
  const { t } = useLanguage();
  const [type, setType] = useState("call");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const activityTypes = [
    { value: "call", label: t("activities.call") },
    { value: "whatsapp", label: t("activities.whatsapp") },
    { value: "email", label: t("activities.email") },
    { value: "meeting", label: t("activities.meeting") },
    { value: "visit", label: t("activities.visit") },
    { value: "demo", label: t("activities.demo") },
    { value: "proposal", label: t("activities.proposal") },
    { value: "closing", label: t("activities.closing") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("activities").insert({
      customer_id: customerId,
      user_id: user?.id || null,
      type,
      note: note.trim(),
    });

    if (error) {
      console.error("Activity insert error:", error.message);
      setLoading(false);
      return;
    }

    // Create notification (non-blocking)
    if (user) {
      const typeLabels: Record<string, string> = { call: "Panggilan", whatsapp: "WhatsApp", email: "Email", meeting: "Meeting", visit: "Kunjungan", demo: "Demo", proposal: "Proposal", closing: "Closing" };
      try {
        const { error: notifErr } = await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Aktivitas Baru",
          message: `${typeLabels[type] || type} telah dicatat`,
          type: "activity_added",
          link: `/customers/${customerId}`,
        });
        if (notifErr) console.error("Notif insert error:", notifErr.message);
      } catch (e) { console.error("Notif catch:", e); }
    }

    setNote("");
    setType("call");
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t("activities.addActivity")}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("activities.addNew")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((at) => (
                  <SelectItem key={at.value} value={at.value}>
                    {at.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder={t("activities.notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !note.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("common.save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
