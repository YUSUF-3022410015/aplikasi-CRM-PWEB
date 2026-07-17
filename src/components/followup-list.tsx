"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, CalendarCheck, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

interface FollowUpItem {
  id: string;
  note?: string;
  due_date: string;
  status: string;
  assigned_user?: { fullname: string } | null;
}

export function FollowUpList({
  followups,
  customerId,
}: {
  followups: FollowUpItem[];
  customerId: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<FollowUpItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> = {
    pending: { label: t("followups.pending"), variant: "default" },
    done: { label: t("followups.done"), variant: "success" },
    cancelled: { label: t("followups.cancelled"), variant: "secondary" },
  };

  const openCreate = () => {
    setEditItem(null);
    setNote("");
    setDueDate("");
    setStatus("pending");
    setOpen(true);
  };

  const openEdit = (fu: FollowUpItem) => {
    setEditItem(fu);
    setNote(fu.note || "");
    setDueDate(fu.due_date?.split("T")[0] || "");
    setStatus(fu.status);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (editItem) {
      await supabase.from("followups").update({
        note: note.trim(),
        due_date: dueDate,
        status,
      }).eq("id", editItem.id);
    } else {
      await supabase.from("followups").insert({
        customer_id: customerId,
        assigned_to: user?.id || "",
        note: note.trim(),
        due_date: dueDate,
        status: "pending",
      });

      // Create notification
      if (user) {
        try {
          await supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Baru",
            message: `Follow-up dijadwalkan pada ${dueDate}`,
            type: "followup_reminder",
            link: `/customers/${customerId}`,
          });
        } catch (e) { console.error("Notif catch:", e); }
      }
    }

    setNote("");
    setDueDate("");
    setStatus("pending");
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("followups").update({ status: newStatus }).eq("id", id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("followups").delete().eq("id", deleteId);
    setDeleteId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={openCreate}>
        <Plus className="mr-2 h-4 w-4" />
        {t("followups.addFollowup")}
      </Button>

      {followups.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">{t("common.noFollowups")}</p>
      ) : (
        <div className="space-y-3">
          {followups.map((fu) => {
            const cfg = statusConfig[fu.status] || statusConfig.pending;
            return (
              <Card key={fu.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{fu.note || t("common.followUp")}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(fu.due_date)}
                          {fu.assigned_user && ` - ${fu.assigned_user.fullname}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={fu.status} onValueChange={(v) => handleStatusChange(fu.id, v)}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                          <SelectItem value="done">{t("followups.done")}</SelectItem>
                          <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(fu)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(fu.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Tambah/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? t("followups.editFollowup") : t("followups.newFollowup")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("followups.dueDate")} *</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("followups.note")}</label>
              <Textarea placeholder={t("followups.notePlaceholder")} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
            {editItem && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("followups.status")}</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                    <SelectItem value="done">{t("followups.done")}</SelectItem>
                    <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={loading || !dueDate}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("followups.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
