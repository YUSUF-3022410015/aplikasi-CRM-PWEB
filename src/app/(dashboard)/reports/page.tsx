"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, TrendingDown, DollarSign, CalendarCheck, Activity, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportReportToExcel, exportReportToPDF } from "@/lib/export-reports";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0058be", "#006947", "#4edea3", "#ba1a1a", "#8b5cf6", "#06b6d4"];

export default function ReportsPage() {
  const { t, tArray } = useLanguage();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    dealsWon: 0,
    dealsLost: 0,
    totalActivities: 0,
    followUpsPending: 0,
    followUpsDone: 0,
    pipelineValue: 0,
    customersByStatus: [] as { name: string; value: number }[],
    revenueByMonth: [] as { name: string; revenue: number }[],
    activitiesByType: [] as { name: string; value: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, quotRes, actRes, fuRes, dealsRes] = await Promise.all([
        supabase.from("customers").select("id, status"),
        supabase.from("quotations").select("id, total, status, created_at"),
        supabase.from("activities").select("id, type"),
        supabase.from("followups").select("id, status"),
        supabase.from("deals").select("id, value, pipeline_stage, status"),
      ]);

      const customers = custRes.data || [];
      const quotations = quotRes.data || [];
      const activities = actRes.data || [];
      const followups = fuRes.data || [];
    const deals = dealsRes.data || [];

    const wonQuotations = quotations.filter((q) => q.status === "approved");
    const lostQuotations = quotations.filter((q) => q.status === "rejected");
    const dealsWon = deals.filter((d) => d.status === "won").length;
    const dealsLost = deals.filter((d) => d.status === "lost").length;
    const totalRevenue = wonQuotations.reduce((s, q) => s + (q.total || 0), 0);
    const pipelineValue = deals
      .filter((d) => d.pipeline_stage !== "won" && d.pipeline_stage !== "lost" && d.status === "active")
      .reduce((sum, d) => sum + (d.value || 0), 0);

    // Customers by status
    const statusMap: Record<string, number> = {};
    customers.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
    const customersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Revenue by month (from quotations)
    const monthShort = tArray("common.monthShort").length > 0 ? tArray("common.monthShort") : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const year = new Date().getFullYear();
    const revenueByMonth = monthShort.map((m, i) => {
      const rev = wonQuotations.filter((q) => { const d = new Date(q.created_at); return d.getFullYear() === year && d.getMonth() === i; })
        .reduce((s, q) => s + (q.total || 0), 0);
      return { name: m, revenue: rev };
    });

    // Activities by type
    const typeMap: Record<string, number> = {};
    activities.forEach((a) => { typeMap[a.type] = (typeMap[a.type] || 0) + 1; });
    const activitiesByType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    setStats({
      totalCustomers: customers.length,
      totalRevenue,
      dealsWon: dealsWon + wonQuotations.length,
      dealsLost: dealsLost + lostQuotations.length,
      totalActivities: activities.length,
      followUpsPending: followups.filter((f) => f.status === "pending").length,
      followUpsDone: followups.filter((f) => f.status === "done").length,
      pipelineValue,
      customersByStatus,
      revenueByMonth,
      activitiesByType,
    });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, tArray]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="outline" onClick={() => {
            const blob = exportReportToExcel(stats);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `laporan_${new Date().toISOString().split("T")[0]}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportExcel")}
          </Button>
          <Button variant="outline" onClick={exportReportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {t("reports.exportPDF")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("reports.totalCustomers")}</span>
              <div className="p-2.5 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("reports.revenue")}</span>
              <div className="p-2.5 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("reports.dealsWon")}</span>
              <div className="p-2.5 rounded-full bg-tertiary/10">
                <TrendingUp className="h-5 w-5 text-tertiary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.dealsWon}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{t("reports.dealsLost")}</span>
              <div className="p-2.5 rounded-full bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.dealsLost}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">{t("reports.tabRevenue")}</TabsTrigger>
          <TabsTrigger value="customers">{t("reports.tabCustomers")}</TabsTrigger>
          <TabsTrigger value="activities">{t("reports.tabActivities")}</TabsTrigger>
          <TabsTrigger value="followups">{t("reports.tabFollowups")}</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle>{t("reports.monthlyRevenue")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#0058be" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers">
          <Card>
            <CardHeader><CardTitle>{t("reports.customerDistribution")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={stats.customersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {stats.customersByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activities">
          <Card>
            <CardHeader><CardTitle>{t("reports.activitiesByType")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.activitiesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="followups">
          <Card>
            <CardHeader><CardTitle>{t("reports.followupSummary")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <CalendarCheck className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("reports.pending")}</p>
                    <p className="text-3xl font-bold">{stats.followUpsPending}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("reports.completed")}</p>
                    <p className="text-3xl font-bold">{stats.followUpsDone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
