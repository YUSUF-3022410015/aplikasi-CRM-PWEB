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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, CalendarCheck, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";

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
  onSuccess,
}: {
  followups: FollowUpItem[];
  customerId: string;
  onSuccess?: () => void;
}) {
  const { t } = useLanguage();
  const { isAdmin, isManager } = usePermissions();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FollowUpItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
    setShowForm(true);
  };

  const openEdit = (fu: FollowUpItem) => {
    setEditItem(fu);
    setNote(fu.note || "");
    setDueDate(fu.due_date?.split("T")[0] || "");
    setStatus(fu.status);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;
    if (!editItem) {
      const today = new Date().toISOString().split("T")[0];
      if (dueDate < today) {
        alert(t("followups.pastDateError"));
        return;
      }
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editItem) {
        const { error } = await supabase.from("followups").update({
          note: note.trim(),
          due_date: dueDate,
          status,
        }).eq("id", editItem.id);
        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }
        if (user) {
          Promise.resolve(supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Diubah",
            message: `Follow-up dijadwalkan pada ${dueDate} telah diperbarui`,
            type: "activity_added",
            link: `/customers/${customerId}`,
          })).catch(() => {});
        }
      } else {
        const { error } = await supabase.from("followups").insert({
          customer_id: customerId,
          assigned_to: user?.id || null,
          note: note.trim(),
          due_date: dueDate,
          status: "pending",
        });
        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }
        if (user) {
          Promise.resolve(supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Baru",
            message: `Follow-up dijadwalkan pada ${dueDate}`,
            type: "followup_reminder",
            link: `/customers/${customerId}`,
          })).catch(() => {});
        }
      }

      setNote("");
      setDueDate("");
      setStatus("pending");
      setShowForm(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("followups").update({ status: newStatus }).eq("id", id);
    if (user) {
      const statusLabel = newStatus === "done" ? "Selesai" : newStatus === "cancelled" ? "Dibatalkan" : "Ditunda";
      Promise.resolve(supabase.from("notifications").insert({
        user_id: user.id,
        title: "Status Follow-up Diubah",
        message: `Status follow-up diubah ke "${statusLabel}"`,
        type: "activity_added",
        link: `/customers/${customerId}`,
      })).catch(() => {});
    }
    onSuccess?.();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("followups").delete().eq("id", deleteId);
    if (user) {
      Promise.resolve(supabase.from("notifications").insert({
        user_id: user.id,
        title: "Follow-up Dihapus",
        message: "Follow-up telah dihapus",
        type: "activity_added",
        link: `/customers/${customerId}`,
      })).catch(() => {});
    }
    setDeleteId(null);
    setConfirmDelete(false);
    onSuccess?.();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {!isManager && !showForm && (
        <Button variant="outline" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("followups.addFollowup")}
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editItem ? t("followups.editFollowup") : t("followups.addFollowup")}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-9 w-full items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">{t("followups.pending")}</option>
                    <option value="done">{t("followups.done")}</option>
                    <option value="cancelled">{t("followups.cancelled")}</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !dueDate}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditItem(null); }}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {followups.length === 0 ? (
        <p className="text-center py-8 text-slate-500">{t("common.noFollowups")}</p>
      ) : (
        <div className="space-y-3">
          {followups.map((fu) => {
            const cfg = statusConfig[fu.status] || statusConfig.pending;
            return (
              <Card key={fu.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-sm">{fu.note || t("common.followUp")}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(fu.due_date)}
                          {fu.assigned_user && ` - ${fu.assigned_user.fullname}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-7 sm:ml-0">
                      {isManager ? (
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      ) : (
                        <Select value={fu.status} onValueChange={(v) => handleStatusChange(fu.id, v)}>
                          <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs pr-7">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                            <SelectItem value="done">{t("followups.done")}</SelectItem>
                            <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {!isManager && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(fu)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setDeleteId(fu.id); setConfirmDelete(true); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => { setConfirmDelete(false); setDeleteId(null); }} />
          <div className="relative w-full max-w-sm mx-4 rounded-xl border bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("followups.deleteTitle")}</h2>
            <p className="text-sm text-slate-500 mb-6">Apakah Anda yakin ingin menghapus follow-up ini?</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => { setConfirmDelete(false); setDeleteId(null); }} className="w-28">{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={handleDelete} className="w-28">{t("common.delete")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
