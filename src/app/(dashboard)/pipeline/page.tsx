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
import { Plus, Loader2, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import type { Deal, Customer } from "@/types/database";

export default function PipelinePage() {
  const { t } = useLanguage();
  const { isManager } = usePermissions();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: "", name: "", value: 0 });
  const [saving, setSaving] = useState(false);
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
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDrop = async (dealId: string, newStage: string) => {
    const deal = deals.find((d) => d.id === dealId);
    await supabase
      .from("deals")
      .update({ pipeline_stage: newStage, updated_at: new Date().toISOString() })
      .eq("id", dealId);
    if (deal) {
      logAudit("update", "deals", dealId, { pipeline_stage: deal.pipeline_stage }, { pipeline_stage: newStage });
    }
    fetchData();
  };

  const handleCreate = async () => {
    if (!form.customer_id || !form.name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: newDeal } = await supabase
      .from("deals")
      .insert({
        customer_id: form.customer_id,
        name: form.name,
        value: form.value || 0,
        pipeline_stage: "lead",
        assigned_to: user?.id || "",
      })
      .select()
      .single();
    if (newDeal) {
      logAudit("create", "deals", newDeal.id, null, newDeal as unknown as Record<string, unknown>);
    }
    setDialogOpen(false);
    setForm({ customer_id: "", name: "", value: 0 });
    setSaving(false);
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
          <p className="text-muted-foreground mt-1.5">{t("pipeline.subtitle")}</p>
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
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse-soft mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-24 bg-muted rounded-xl animate-pulse-soft" />
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
                  <p className="text-xs text-muted-foreground font-semibold mb-3">
                    {formatCurrency(stageTotals[stage.key])}
                  </p>
                )}
                <div className="space-y-3 min-h-[120px]">
                  {stageDeals.length === 0 ? (
                    <div className="flex items-center justify-center h-[80px] rounded-xl border-2 border-dashed border-border/50">
                      <p className="text-xs text-muted-foreground">{t("pipeline.empty")}</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", deal.id);
                        }}
                        className="cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card border-border/50"
                      >
                        <CardContent className="p-3.5">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-muted-foreground/40">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm truncate">{deal.name}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {(deal.customer as { name: string })?.name || t("pipeline.noCompany")}
                              </p>
                              {deal.value > 0 && (
                                <p className="text-xs font-semibold text-primary mt-1.5">
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
                <SelectTrigger className="bg-muted/50 focus:bg-background">
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
                className="bg-muted/50 focus:bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pipeline.dealValue")}</Label>
              <Input
                type="number"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                placeholder="0"
                className="bg-muted/50 focus:bg-background"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={saving || !form.customer_id || !form.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
