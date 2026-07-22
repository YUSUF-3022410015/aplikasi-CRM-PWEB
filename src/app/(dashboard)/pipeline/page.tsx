"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  company: string;
  pipeline_stage: string;
}

export default function PipelinePage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const stages = [
    { key: "lead", label: t("pipeline.lead"), color: "bg-slate-100 border-slate-300" },
    { key: "qualified", label: t("pipeline.qualified"), color: "bg-blue-50 border-blue-300" },
    { key: "contacted", label: t("pipeline.contacted"), color: "bg-cyan-50 border-cyan-300" },
    { key: "meeting", label: t("pipeline.meeting"), color: "bg-yellow-50 border-yellow-300" },
    { key: "proposal", label: t("pipeline.proposal"), color: "bg-orange-50 border-orange-300" },
    { key: "negotiation", label: t("pipeline.negotiation"), color: "bg-purple-50 border-purple-300" },
    { key: "won", label: t("pipeline.won"), color: "bg-green-50 border-green-300" },
    { key: "lost", label: t("pipeline.lost"), color: "bg-red-50 border-red-300" },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select("id, name, company, pipeline_stage")
      .order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDrop = async (customerId: string, newStage: string) => {
    await supabase
      .from("customers")
      .update({ pipeline_stage: newStage, updated_at: new Date().toISOString() })
      .eq("id", customerId);
    fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("pipeline.title")}</h1>
        <p className="text-muted-foreground mt-1.5">{t("pipeline.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[280px] flex-shrink-0">
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse-soft mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-20 bg-muted rounded-xl animate-pulse-soft" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage) => {
            const stageCustomers = customers.filter((c) => c.pipeline_stage === stage.key);
            return (
              <div
                key={stage.key}
                className={`min-w-[280px] flex-shrink-0 rounded-xl border-2 p-4 ${stage.color} shadow-sm`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const customerId = e.dataTransfer.getData("text/plain");
                  if (customerId) handleDrop(customerId, stage.key);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${stage.color.split(' ')[0].replace('bg-', 'bg-').replace('border-', '')}`} />
                    <h3 className="font-bold text-sm tracking-wide">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs">{stageCustomers.length}</Badge>
                </div>
                <div className="space-y-3 min-h-[120px]">
                  {stageCustomers.map((c) => (
                    <Card
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                      }}
                      className="cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card border-border/50"
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{c.company || t("pipeline.noCompany")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageCustomers.length === 0 && (
                    <div className="flex items-center justify-center h-[80px] rounded-xl border-2 border-dashed border-border/50">
                      <p className="text-xs text-muted-foreground">{t("pipeline.empty")}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
