"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface FollowUp {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer_id: string;
  customer?: { name: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> = {};

export default function FollowUpsPage() {
  const { t } = useLanguage();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FollowUp | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_id: "", note: "", due_date: "", status: "pending" });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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
    setDialogOpen(true);
  };

  const openEdit = (f: FollowUp) => {
    setEditItem(f);
    setForm({ customer_id: f.customer_id, note: f.note || "", due_date: f.due_date?.split("T")[0] || "", status: f.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer_id || !form.due_date) return;
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
  const overdueCount = followups.filter((f) => f.status === "pending" && f.due_date < today).length;
  const doneCount = followups.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("followups.title")}</h1>
          <p className="text-muted-foreground">{t("followups.subtitle2")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("followups.addFollowup")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("followups.pending")}</span>
              <div className="p-2.5 rounded-full bg-tertiary/10">
                <CalendarCheck className="h-5 w-5 text-tertiary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("followups.overdue")}</span>
              <div className="p-2.5 rounded-full bg-destructive/10">
                <CalendarCheck className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("followups.completed")}</span>
              <div className="p-2.5 rounded-full bg-tertiary/10">
                <CalendarCheck className="h-5 w-5 text-tertiary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{doneCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("followups.allFollowups")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("followups.note")}</TableHead>
                  <TableHead>{t("followups.customer")}</TableHead>
                  <TableHead>{t("followups.dueDate")}</TableHead>
                  <TableHead>{t("followups.status")}</TableHead>
                  <TableHead className="w-[120px]">{t("followups.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : followups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">{t("followups.empty")}</TableCell>
                  </TableRow>
                ) : (
                  followups.map((f) => {
                    const cfg = getStatusConfig()[f.status] || getStatusConfig().pending;
                    const isOverdue = f.status === "pending" && f.due_date < today;
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium max-w-[250px] truncate">{f.note || "-"}</TableCell>
                        <TableCell>{f.customer?.name || "-"}</TableCell>
                        <TableCell>
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {formatDate(f.due_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select value={f.status} onValueChange={(v) => handleStatusChange(f.id, v)}>
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                              <SelectItem value="done">{t("followups.done")}</SelectItem>
                              <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(f)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(f.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? t("followups.editFollowup") : t("followups.addFollowup")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("followups.customer")} *</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder={t("customers.title")} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("followups.dueDate")} *</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("followups.note")}</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("followups.notePlaceholder")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("followups.status")}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("followups.pending")}</SelectItem>
                  <SelectItem value="done">{t("followups.done")}</SelectItem>
                  <SelectItem value="cancelled">{t("followups.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
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
