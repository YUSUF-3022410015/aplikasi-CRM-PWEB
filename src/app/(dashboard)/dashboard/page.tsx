"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, CalendarCheck, DollarSign, AlertTriangle, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard-charts";
import { useLanguage } from "@/components/language-provider";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, tArray } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const [customersRes, activitiesRes, followupsRes, quotationsRes] = await Promise.all([
        supabase.from("customers").select("id, status, created_at", { count: "exact" }),
        supabase.from("activities").select("id, type, created_at"),
        supabase.from("followups").select("id, status, due_date"),
        supabase.from("quotations").select("id, total, status, created_at"),
      ]);

      const customers = customersRes.data || [];
      const activities = activitiesRes.data || [];
      const followups = followupsRes.data || [];
      const quotations = quotationsRes.data || [];

      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const newCustomersThisMonth = customers.filter((c) => c.created_at >= monthStart).length;
      const followUpsToday = followups.filter((f) => f.due_date?.startsWith(today) && f.status === "pending").length;
      const followUpsOverdue = followups.filter((f) => f.due_date < today && f.status === "pending").length;

      const dealsWon = quotations.filter((q) => q.status === "approved").length;
      const dealsLost = quotations.filter((q) => q.status === "rejected").length;
      const totalRevenue = quotations
        .filter((q) => q.status === "approved")
        .reduce((sum, q) => sum + (q.total || 0), 0);
      const pipelineValue = quotations
        .filter((q) => q.status === "draft" || q.status === "sent")
        .reduce((sum, q) => sum + (q.total || 0), 0);

      const activityTypeMap: Record<string, number> = {};
      activities.forEach((a) => { activityTypeMap[a.type] = (activityTypeMap[a.type] || 0) + 1; });
      const activitiesByType = Object.entries(activityTypeMap).map(([name, value]) => ({ name, value }));

      const statusMap: Record<string, number> = {};
      customers.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
      const customersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      const monthShort = tArray("common.monthShort").length > 0 ? tArray("common.monthShort") : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthlyData = monthShort.map((month, i) => {
        const monthQuotations = quotations.filter((q) => {
          const d = new Date(q.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        });
        return {
          name: month,
          revenue: monthQuotations.filter((q) => q.status === "approved").reduce((sum, q) => sum + (q.total || 0), 0),
          deals: monthQuotations.filter((q) => q.status === "approved").length,
        };
      });

      setStats({
        totalCustomers: customersRes.count || 0,
        newCustomers: newCustomersThisMonth,
        totalRevenue,
        dealsWon,
        dealsLost,
        followUpsToday,
        followUpsOverdue,
        pipelineValue,
        monthlyData,
        activitiesByType,
        customersByStatus,
      });
      setLoading(false);
    };

    fetchStats();
  }, [supabase, tArray]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  const statCards = [
    { title: t("dashboard.totalCustomers"), value: stats.totalCustomers, icon: Users, color: "text-blue-600" },
    { title: t("dashboard.newCustomers"), value: stats.newCustomers, icon: UserPlus, color: "text-green-600" },
    { title: t("dashboard.revenue"), value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600" },
    { title: t("dashboard.dealsWon"), value: stats.dealsWon, icon: TrendingUp, color: "text-green-600" },
    { title: t("dashboard.dealsLost"), value: stats.dealsLost, icon: AlertTriangle, color: "text-red-600" },
    { title: t("dashboard.followUpsToday"), value: stats.followUpsToday, icon: CalendarCheck, color: "text-orange-600" },
    { title: t("dashboard.followUpsOverdue"), value: stats.followUpsOverdue, icon: AlertTriangle, color: "text-red-600" },
    { title: t("dashboard.pipelineValue"), value: formatCurrency(stats.pipelineValue), icon: Package, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("dashboard.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs font-medium sm:text-sm">{stat.title}</CardTitle>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="text-lg font-bold sm:text-2xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DashboardCharts
        data={stats.monthlyData}
        activitiesByType={stats.activitiesByType}
        customersByStatus={stats.customersByStatus}
      />
    </div>
  );
}
