"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, GripVertical, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import type { Deal, Customer } from "@/types/database";

export default function PipelinePage() {
  const { t } = useLanguage();
  const { isManager, isAdmin, profile } = usePermissions();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: "", name: "", value: 0 });
  const [saving, setSaving] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ customer_id: "", name: "", value: 0, pipeline_stage: "lead" });
  const [deleteDealId, setDeleteDealId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [supabase] = useState(() => createClient());

  const stages = [
    { key: "lead", label: t("pipeline.lead"), color: "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" },
    { key: "qualified", label: t("pipeline.qualified"), color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
    { key: "contacted", label: t("pipeline.contacted"), color: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800" },
    { key: "meeting", label: t("pipeline.meeting"), color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800" },
    { key: "proposal", label: t("pipeline.proposal"), color: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800" },
    { key: "negotiation", label: t("pipeline.negotiation"), color: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800" },
    { key: "won", label: t("pipeline.won"), color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" },
    { key: "lost", label: t("pipeline.lost"), color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        supabase
          .from("deals")
          .select("*, customer:customers(name)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        supabase.from("customers").select("*").is("deleted_at", null).order("name"),
      ]);
      setDeals(dRes.data || []);
      setCustomers(cRes.data || []);
    } catch (error) {
      console.error("Failed to fetch pipeline data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, [supabase]);

  const handleDrop = async (dealId: string, newStage: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // PRD §3.3: Manager read-only, Sales hanya boleh edit deal miliknya sendiri
    if (profile?.role === "manager") return;
    if (profile?.role === "sales" && deal.assigned_to !== userId) return;

    const updateData: Record<string, string> = {
      pipeline_stage: newStage,
      updated_at: new Date().toISOString(),
    };
    // Update status when moving to won/lost
    if (newStage === "won") {
      updateData.status = "won";
    } else if (newStage === "lost") {
      updateData.status = "lost";
    } else if (deal?.status === "won" || deal?.status === "lost") {
      // Moving back from won/lost to active stage
      updateData.status = "active";
    }
    await supabase
      .from("deals")
      .update(updateData)
      .eq("id", dealId);
    logAudit("update", "deals", dealId, { pipeline_stage: deal.pipeline_stage, status: deal.status }, { pipeline_stage: newStage, status: updateData.status || deal.status });
    fetchData();
  };

  const handleCreate = async () => {
    if (!form.customer_id || !form.name || form.value <= 0) return;
    if (profile?.role === "manager") return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: newDeal } = await supabase
      .from("deals")
      .insert({
        customer_id: form.customer_id,
        name: form.name,
        value: form.value || 0,
        pipeline_stage: "lead",
        assigned_to: user?.id || null,
      })
      .select()
      .single();
    if (newDeal) {
      logAudit("create", "deals", newDeal.id, null, newDeal as unknown as Record<string, unknown>);
      // Fire-and-forget notification untuk deal baru
      if (user) {
        const custName = customers.find((c) => c.id === form.customer_id)?.name || "";
        Promise.resolve(supabase.from("notifications").insert({
          user_id: user.id,
          title: "Deal Baru",
          message: `Deal "${form.name}" untuk ${custName} berhasil dibuat`,
          type: "activity_added",
          link: "/pipeline",
        })).catch(() => {});
      }
    }
    setDialogOpen(false);
    setForm({ customer_id: "", name: "", value: 0 });
    setSaving(false);
    fetchData();
  };

  const openEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditForm({
      customer_id: deal.customer_id,
      name: deal.name,
      value: deal.value || 0,
      pipeline_stage: deal.pipeline_stage,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateDeal = async () => {
    if (!selectedDeal || !editForm.name || !editForm.customer_id || editForm.value <= 0) return;
    if (profile?.role === "manager") return;
    setUpdating(true);
    const oldData = { ...selectedDeal };
    const status = editForm.pipeline_stage === "won" ? "won" : editForm.pipeline_stage === "lost" ? "lost" : "active";

    await supabase
      .from("deals")
      .update({
        name: editForm.name,
        customer_id: editForm.customer_id,
        value: editForm.value,
        pipeline_stage: editForm.pipeline_stage,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedDeal.id);

    logAudit("update", "deals", selectedDeal.id, oldData as unknown as Record<string, unknown>, { ...editForm, status });
    setEditDialogOpen(false);
    setSelectedDeal(null);
    setUpdating(false);
    fetchData();
  };

  const handleDeleteDeal = async () => {
    if (!deleteDealId) return;
    if (profile?.role !== "admin") return;
    setDeleting(true);
    const deal = deals.find((d) => d.id === deleteDealId);
    const now = new Date().toISOString();
    await supabase.from("deals").update({ deleted_at: now }).eq("id", deleteDealId);
    if (deal) {
      logAudit("delete", "deals", deleteDealId, deal as unknown as Record<string, unknown>, null);
    }
    setDeleteDealId(null);
    setEditDialogOpen(false);
    setSelectedDeal(null);
    setDeleting(false);
    fetchData();
  };

  const stageTotals: Record<string, number> = {};
  stages.forEach((s) => {
    stageTotals[s.key] = deals.filter((d) => d.pipeline_stage === s.key).reduce((sum, d) => sum + (d.value || 0), 0);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("pipeline.title")}</h1>
          <p className="text-slate-500 mt-1.5">{t("pipeline.subtitle")}</p>
        </div>
        {!isManager && (
          <Button onClick={() => setDialogOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("pipeline.addDeal")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[280px] flex-shrink-0">
              <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse-soft mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-24 bg-slate-100 rounded-xl animate-pulse-soft" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.pipeline_stage === stage.key);
            return (
              <div
                key={stage.key}
                className={`min-w-[280px] flex-shrink-0 rounded-xl border-2 p-4 ${stage.color} shadow-sm`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dealId = e.dataTransfer.getData("text/plain");
                  if (dealId) handleDrop(dealId, stage.key);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs">{stageDeals.length}</Badge>
                </div>
                {stageTotals[stage.key] > 0 && (
                  <p className="text-xs text-slate-500 font-semibold mb-3">
                    {formatCurrency(stageTotals[stage.key])}
                  </p>
                )}
                <div className="space-y-3 min-h-[120px]">
                  {stageDeals.length === 0 ? (
                    <div className="flex items-center justify-center h-[80px] rounded-xl border-2 border-dashed border-slate-200/50">
                      <p className="text-xs text-slate-500">{t("pipeline.empty")}</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", deal.id);
                        }}
                        onClick={() => openEditDeal(deal)}
                        className="cursor-pointer active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white border-slate-200/50 group/card"
                      >
                        <CardContent className="p-3.5">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-slate-500/40">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-sm truncate">{deal.name}</p>
                                <Pencil className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0" />
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {(deal.customer as { name: string })?.name || t("pipeline.noCompany")}
                              </p>
                              {deal.value > 0 && (
                                <p className="text-xs font-semibold text-blue-600 mt-1.5">
                                  {formatCurrency(deal.value)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{t("pipeline.addDeal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.customer")} *</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger className="bg-slate-100/50 focus:bg-white">
                  <SelectValue placeholder={t("customers.title")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.dealName")} *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("pipeline.dealNamePlaceholder")}
                className="bg-slate-100/50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.dealValue")}</Label>
              <Input
                type="number"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                placeholder="0"
                className="bg-slate-100/50 focus:bg-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={saving || !form.customer_id || !form.name || form.value <= 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit / View Deal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center justify-between">
              <span>{t("common.edit")} Deal</span>
              {isAdmin && selectedDeal && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteDealId(selectedDeal.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("common.delete")}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.customer")} *</Label>
              <Select
                value={editForm.customer_id}
                onValueChange={(v) => setEditForm({ ...editForm, customer_id: v })}
                disabled={isManager}
              >
                <SelectTrigger className="bg-slate-100/50 focus:bg-white">
                  <SelectValue placeholder={t("customers.title")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.dealName")} *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("pipeline.dealNamePlaceholder")}
                className="bg-slate-100/50 focus:bg-white"
                disabled={isManager}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.dealValue")} (IDR) *</Label>
              <Input
                type="number"
                value={editForm.value || ""}
                onChange={(e) => setEditForm({ ...editForm, value: Number(e.target.value) })}
                placeholder="0"
                className="bg-slate-100/50 focus:bg-white"
                disabled={isManager}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("customers.pipeline")} *</Label>
              <Select
                value={editForm.pipeline_stage}
                onValueChange={(v) => setEditForm({ ...editForm, pipeline_stage: v })}
                disabled={isManager}
              >
                <SelectTrigger className="bg-slate-100/50 focus:bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t("common.cancel")}</Button>
            {!isManager && (
              <Button onClick={handleUpdateDeal} disabled={updating || !editForm.customer_id || !editForm.name || editForm.value <= 0}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("common.save")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Deal Alert Dialog */}
      <AlertDialog open={!!deleteDealId} onOpenChange={() => setDeleteDealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus deal ini? Data deal akan disembunyikan dari pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeal}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
