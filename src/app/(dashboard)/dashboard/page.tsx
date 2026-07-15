"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, CalendarCheck, DollarSign, AlertTriangle, Package, TrendingDown } from "lucide-react";
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
      const followUpsOverdue = followups.filter((f) => {
        if (!f.due_date || f.status !== "pending") return false;
        const dueDate = new Date(f.due_date).toISOString().split("T")[0];
        return dueDate < today;
      }).length;

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
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse-soft" />
          <div className="h-4 w-64 bg-muted rounded-md animate-pulse-soft mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded-md animate-pulse-soft" />
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse-soft" />
              </div>
              <div className="h-8 w-20 bg-muted rounded-md animate-pulse-soft" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse-soft mb-4" />
              <div className="h-48 w-full bg-muted rounded-lg animate-pulse-soft" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: t("dashboard.totalCustomers"), value: stats.totalCustomers, icon: Users, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { title: t("dashboard.newCustomers"), value: stats.newCustomers, icon: UserPlus, iconBg: "bg-tertiary/10", iconColor: "text-tertiary" },
    { title: t("dashboard.revenue"), value: formatCurrency(stats.totalRevenue), icon: DollarSign, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { title: t("dashboard.dealsWon"), value: stats.dealsWon, icon: TrendingUp, iconBg: "bg-tertiary/10", iconColor: "text-tertiary" },
    { title: t("dashboard.dealsLost"), value: stats.dealsLost, icon: TrendingDown, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { title: t("dashboard.followUpsToday"), value: stats.followUpsToday, icon: CalendarCheck, iconBg: "bg-tertiary/10", iconColor: "text-tertiary" },
    { title: t("dashboard.followUpsOverdue"), value: stats.followUpsOverdue, icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { title: t("dashboard.pipelineValue"), value: formatCurrency(stats.pipelineValue), icon: Package, iconBg: "bg-primary/10", iconColor: "text-primary" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</span>
                <div className={`p-1.5 sm:p-2.5 rounded-full ${stat.iconBg} shrink-0`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        data={stats.monthlyData}
        activitiesByType={stats.activitiesByType}
        customersByStatus={stats.customersByStatus}
      />
    </div>
  );
}
