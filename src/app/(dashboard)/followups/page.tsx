"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";

interface FollowUp {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer_id: string;
  customer?: { name: string } | null;
}

export default function FollowUpsPage() {
  const { t } = useLanguage();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FollowUp | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_id: "", note: "", due_date: "", status: "pending" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [supabase] = useState(() => createClient());
  const { isAdmin, isManager } = usePermissions();

  const getStatusConfig = (): Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> => ({
    pending: { label: t("followups.pending"), variant: "default" },
    done: { label: t("followups.done"), variant: "success" },
    cancelled: { label: t("followups.cancelled"), variant: "secondary" },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, cRes] = await Promise.all([
        supabase.from("followups").select("*, customer:customers(name, deleted_at)").order("due_date", { ascending: true }),
        supabase.from("customers").select("id, name").is("deleted_at", null).order("name"),
      ]);
      const filteredFollowups = (fRes.data || []).filter((f: any) => f.customer && !f.customer.deleted_at);
      setFollowups(filteredFollowups);
      setCustomers(cRes.data || []);
    } catch (error) {
      console.error("Failed to fetch followups:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ customer_id: "", note: "", due_date: "", status: "pending" });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (f: FollowUp) => {
    setEditItem(f);
    setForm({ customer_id: f.customer_id, note: f.note || "", due_date: f.due_date?.split("T")[0] || "", status: f.status });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer_id || !form.due_date) return;
    if (!editItem) {
      const today = new Date().toISOString().split("T")[0];
      if (form.due_date < today) {
        setFormError(t("followups.pastDateError"));
        return;
      }
    }
    setFormError("");
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const custName = customers.find((c) => c.id === form.customer_id)?.name || "";

      if (editItem) {
        const { error } = await supabase.from("followups").update({
          customer_id: form.customer_id,
          note: form.note,
          due_date: form.due_date,
          status: form.status,
        }).eq("id", editItem.id);
        if (error) {
          setFormError(error.message);
          setSaving(false);
          return;
        }
        if (user) {
          Promise.resolve(supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Diubah",
            message: `Follow-up untuk ${custName} telah diperbarui`,
            type: "activity_added",
            link: "/followups",
          })).catch(() => {});
        }
      } else {
        const { error } = await supabase.from("followups").insert({
          customer_id: form.customer_id,
          assigned_to: user?.id || null,
          note: form.note,
          due_date: form.due_date,
          status: form.status,
        });
        if (error) {
          setFormError(error.message);
          setSaving(false);
          return;
        }
        if (user) {
          Promise.resolve(supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Baru",
            message: `Follow-up untuk ${custName} dijadwalkan pada ${form.due_date}`,
            type: "followup_reminder",
            link: "/followups",
          })).catch(() => {});
        }
      }

      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setFormError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { data: { user } } = await supabase.auth.getUser();
    const deleted = followups.find((f) => f.id === deleteId);
    await supabase.from("followups").delete().eq("id", deleteId);
    if (user && deleted) {
      const custName = customers.find((c) => c.id === deleted.customer_id)?.name || "";
      Promise.resolve(supabase.from("notifications").insert({
        user_id: user.id,
        title: "Follow-up Dihapus",
        message: `Follow-up untuk ${custName} telah dihapus`,
        type: "activity_added",
        link: "/followups",
      })).catch(() => {});
    }
    setDeleteId(null);
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const fu = followups.find((f) => f.id === id);
    await supabase.from("followups").update({ status }).eq("id", id);
    if (user && fu) {
      const custName = customers.find((c) => c.id === fu.customer_id)?.name || "";
      const statusLabel = status === "done" ? "Selesai" : status === "cancelled" ? "Dibatalkan" : "Ditunda";
      Promise.resolve(supabase.from("notifications").insert({
        user_id: user.id,
        title: "Status Follow-up Diubah",
        message: `Follow-up untuk ${custName} diubah ke "${statusLabel}"`,
        type: "activity_added",
        link: "/followups",
      })).catch(() => {});
    }
    fetchData();
  };

  const today = new Date().toISOString().split("T")[0];
  const pendingCount = followups.filter((f) => f.status === "pending").length;
  const overdueCount = followups.filter((f) => {
    if (f.status !== "pending" || !f.due_date) return false;
    const dueDate = new Date(f.due_date).toISOString().split("T")[0];
    return dueDate < today;
  }).length;
  const doneCount = followups.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("followups.title")}</h1>
          <p className="text-slate-500 mt-1.5">{t("followups.subtitle2")}</p>
        </div>
        {!isManager && (
          <Button onClick={openCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("followups.addFollowup")}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("followups.pending"), value: pendingCount, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600" },
          { label: t("followups.overdue"), value: overdueCount, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-600" },
          { label: t("followups.completed"), value: doneCount, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600" },
        ].map((s, i) => (
          <Card key={s.label} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-slate-200/50 overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500/80 uppercase tracking-wider">{s.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <CalendarCheck className={`h-5 w-5 ${s.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/50 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-200/50 pb-3">
          <CardTitle className="text-base font-bold">{t("followups.allFollowups")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-slate-100/50">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("followups.note")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("followups.customer")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("followups.dueDate")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("followups.status")}</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">{t("followups.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : followups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">{t("followups.empty")}</TableCell>
                  </TableRow>
                ) : (
                  followups.map((f) => {
                    const cfg = getStatusConfig()[f.status] || getStatusConfig().pending;
                    const isOverdue = f.status === "pending" && new Date(f.due_date).toISOString().split("T")[0] < today;
                    return (
                      <TableRow key={f.id} className="hover:bg-slate-100/30 transition-colors group">
                        <TableCell className="font-medium max-w-[250px] truncate">{f.note || "-"}</TableCell>
                        <TableCell className="text-slate-500">
                          {f.customer?.name ? (
                            <Link href={`/customers/${f.customer_id}`} className="hover:text-blue-600 transition-colors">
                              {f.customer.name}
                            </Link>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <span className={isOverdue ? "text-red-600 font-semibold" : "text-slate-500"}>
                            {isOverdue && <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5 animate-pulse-soft" />}
                            {formatDate(f.due_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isManager ? (
                            <Badge variant={cfg.variant} className="text-xs font-medium">{cfg.label}</Badge>
                          ) : (
                            <Select value={f.status} onValueChange={(v) => handleStatusChange(f.id, v)}>
                              <SelectTrigger className="w-[150px] h-8 text-xs shadow-none pr-7">
                                <Badge variant={cfg.variant} className="text-xs font-medium">{cfg.label}</Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                                <SelectItem value="done">{t("followups.done")}</SelectItem>
                                <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {!isManager && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-600/10 hover:text-blue-600" onClick={() => openEdit(f)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-600/10 hover:text-red-600" onClick={() => setDeleteId(f.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah/Edit — custom modal + native select biar gak ada konflik portal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setDialogOpen(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editItem ? t("followups.editFollowup") : t("followups.addFollowup")}</h2>
              <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("followups.customer")} *</Label>
                <select
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="">{t("customers.title")}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("followups.dueDate")} *</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("followups.note")}</Label>
                <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("followups.notePlaceholder")} rows={3} className="bg-slate-50 focus:bg-white resize-none" />
              </div>
              {editItem && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t("followups.status")}</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    <option value="pending">{t("followups.pending")}</option>
                    <option value="done">{t("followups.done")}</option>
                    <option value="cancelled">{t("followups.cancelled")}</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={saving || !form.customer_id || !form.due_date}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm mx-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold mb-4">{t("followups.deleteTitle")}</h2>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="w-28">{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={handleDelete} className="w-28">{t("common.delete")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
