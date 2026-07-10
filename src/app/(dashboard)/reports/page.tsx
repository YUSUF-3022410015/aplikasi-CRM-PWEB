"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, TrendingDown, DollarSign, CalendarCheck, Activity, BarChart3, Download, FileText } from "lucide-react";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ReportsPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    dealsWon: 0,
    dealsLost: 0,
    totalActivities: 0,
    followUpsPending: 0,
    followUpsDone: 0,
    customersByStatus: [] as { name: string; value: number }[],
    revenueByMonth: [] as { name: string; revenue: number }[],
    activitiesByType: [] as { name: string; value: number }[],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [custRes, quotRes, actRes, fuRes] = await Promise.all([
      supabase.from("customers").select("id, status"),
      supabase.from("quotations").select("id, total, status, created_at"),
      supabase.from("activities").select("id, type"),
      supabase.from("followups").select("id, status"),
    ]);

    const customers = custRes.data || [];
    const quotations = quotRes.data || [];
    const activities = actRes.data || [];
    const followups = fuRes.data || [];

    const won = quotations.filter((q) => q.status === "approved");
    const lost = quotations.filter((q) => q.status === "rejected");
    const totalRevenue = won.reduce((s, q) => s + (q.total || 0), 0);

    // Customers by status
    const statusMap: Record<string, number> = {};
    customers.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
    const customersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Revenue by month
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const year = new Date().getFullYear();
    const revenueByMonth = months.map((m, i) => {
      const rev = won.filter((q) => { const d = new Date(q.created_at); return d.getFullYear() === year && d.getMonth() === i; })
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
      dealsWon: won.length,
      dealsLost: lost.length,
      totalActivities: activities.length,
      followUpsPending: followups.filter((f) => f.status === "pending").length,
      followUpsDone: followups.filter((f) => f.status === "done").length,
      customersByStatus,
      revenueByMonth,
      activitiesByType,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={() => exportReportToExcel(stats)}>
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportExcel")}
          </Button>
          <Button variant="outline" onClick={exportReportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {t("reports.exportPDF")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.totalCustomers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalCustomers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.dealsWon")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.dealsWon}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.dealsLost")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.dealsLost}</div></CardContent>
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
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
              <div className="grid grid-cols-2 gap-6">
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
