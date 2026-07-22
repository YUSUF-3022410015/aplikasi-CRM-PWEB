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
import { useToast } from "@/components/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  const { isAdmin } = usePermissions();

  const getStatusConfig = (): Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> => ({
    pending: { label: t("followups.pending"), variant: "default" },
    done: { label: t("followups.done"), variant: "success" },
    cancelled: { label: t("followups.cancelled"), variant: "secondary" },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [fRes, cRes] = await Promise.all([
      supabase.from("followups").select("*, customer:customers(name)").order("due_date", { ascending: true }),
      supabase.from("customers").select("id, name").order("name"),
    ]);
    setFollowups(fRes.data || []);
    setCustomers(cRes.data || []);
    setLoading(false);
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
    const today = new Date().toISOString().split("T")[0];
    if (form.due_date < today) {
      setFormError(t("followups.pastDateError"));
      return;
    }
    setFormError("");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (editItem) {
      await supabase.from("followups").update({
        customer_id: form.customer_id,
        note: form.note,
        due_date: form.due_date,
        status: form.status,
      }).eq("id", editItem.id);
    } else {
      await supabase.from("followups").insert({
        customer_id: form.customer_id,
        assigned_to: user?.id || "",
        note: form.note,
        due_date: form.due_date,
        status: form.status,
      });
      // Create notification (non-blocking)
      if (user) {
        const custName = customers.find((c) => c.id === form.customer_id)?.name || "";
        try {
          const { error: notifErr } = await supabase.from("notifications").insert({
            user_id: user.id,
            title: "Follow-up Baru",
            message: `Follow-up untuk ${custName} dijadwalkan pada ${form.due_date}`,
            type: "followup_reminder",
            link: "/followups",
          });
          if (notifErr) console.error("Notif insert error:", notifErr.message);
        } catch (e) { console.error("Notif catch:", e); }
      }
    }

    setDialogOpen(false);
    setSaving(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("followups").delete().eq("id", deleteId);
    setDeleteId(null);
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("followups").update({ status }).eq("id", id);
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
          <p className="text-muted-foreground mt-1.5">{t("followups.subtitle2")}</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("followups.addFollowup")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("followups.pending"), value: pendingCount, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600" },
          { label: t("followups.overdue"), value: overdueCount, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-600" },
          { label: t("followups.completed"), value: doneCount, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600" },
        ].map((s, i) => (
          <Card key={s.label} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-border/50 overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">{s.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <CalendarCheck className={`h-5 w-5 ${s.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-bold">{t("followups.allFollowups")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
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
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : followups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{t("followups.empty")}</TableCell>
                  </TableRow>
                ) : (
                  followups.map((f) => {
                    const cfg = getStatusConfig()[f.status] || getStatusConfig().pending;
                    const isOverdue = f.status === "pending" && f.due_date < today;
                    return (
                      <TableRow key={f.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="font-medium max-w-[250px] truncate">{f.note || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {f.customer?.name ? (
                            <Link href={`/customers/${f.customer_id}`} className="hover:text-primary transition-colors">
                              {f.customer.name}
                            </Link>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <span className={isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                            {isOverdue && <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5 animate-pulse-soft" />}
                            {formatDate(f.due_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select value={f.status} onValueChange={(v) => handleStatusChange(f.id, v)}>
                            <SelectTrigger className="w-[110px] h-8 text-xs shadow-none">
                              <Badge variant={cfg.variant} className="text-xs font-medium">{cfg.label}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                              <SelectItem value="done">{t("followups.done")}</SelectItem>
                              <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(f)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(f.id)}>
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

      {/* Dialog Tambah/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{editItem ? t("followups.editFollowup") : t("followups.addFollowup")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("followups.customer")} *</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger className="bg-muted/50 focus:bg-background"><SelectValue placeholder={t("customers.title")} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("followups.dueDate")} *</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("followups.note")}</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("followups.notePlaceholder")} rows={3} className="bg-muted/50 focus:bg-background resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("followups.status")}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-muted/50 focus:bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                  <SelectItem value="done">{t("followups.done")}</SelectItem>
                  <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.customer_id || !form.due_date}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center text-lg">{t("followups.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="sm:w-28">{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete} className="sm:w-28">{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
