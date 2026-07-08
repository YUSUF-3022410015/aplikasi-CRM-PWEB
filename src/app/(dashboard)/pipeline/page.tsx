"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  company: string;
  pipeline_stage: string;
}

const stages = [
  { key: "lead", label: "Lead", color: "bg-slate-100 border-slate-300" },
  { key: "qualified", label: "Qualified", color: "bg-blue-50 border-blue-300" },
  { key: "contacted", label: "Contacted", color: "bg-cyan-50 border-cyan-300" },
  { key: "meeting", label: "Meeting", color: "bg-yellow-50 border-yellow-300" },
  { key: "proposal", label: "Proposal", color: "bg-orange-50 border-orange-300" },
  { key: "negotiation", label: "Negotiation", color: "bg-purple-50 border-purple-300" },
  { key: "won", label: "Won", color: "bg-green-50 border-green-300" },
  { key: "lost", label: "Lost", color: "bg-red-50 border-red-300" },
];

export default function PipelinePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">Visualisasi alur penjualan pelanggan</p>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageCustomers = customers.filter((c) => c.pipeline_stage === stage.key);
            return (
              <div
                key={stage.key}
                className={`min-w-[280px] flex-shrink-0 rounded-lg border-2 p-4 ${stage.color}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const customerId = e.dataTransfer.getData("text/plain");
                  if (customerId) handleDrop(customerId, stage.key);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="secondary">{stageCustomers.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageCustomers.map((c) => (
                    <Card
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                      }}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.company || "Tanpa perusahaan"}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {stageCustomers.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Kosong</p>
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
