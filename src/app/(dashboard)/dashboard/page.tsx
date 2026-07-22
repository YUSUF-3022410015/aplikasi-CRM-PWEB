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
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchStats = async () => {
      const [customersRes, activitiesRes, followupsRes, dealsRes] = await Promise.all([
        supabase.from("customers").select("id, status, created_at", { count: "exact" }),
        supabase.from("activities").select("id, type, created_at"),
        supabase.from("followups").select("id, status, due_date"),
        supabase.from("deals").select("id, value, pipeline_stage, status, created_at"),
      ]);

      const customers = customersRes.data || [];
      const activities = activitiesRes.data || [];
      const followups = followupsRes.data || [];
      const deals = dealsRes.data || [];

      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const newCustomersThisMonth = customers.filter((c) => c.created_at >= monthStart).length;
      const followUpsToday = followups.filter((f) => f.due_date?.startsWith(today) && f.status === "pending").length;
      const followUpsOverdue = followups.filter((f) => {
        if (!f.due_date || f.status !== "pending") return false;
        const dueDate = new Date(f.due_date).toISOString().split("T")[0];
        return dueDate < today;
      }).length;

      const dealsWon = deals.filter((d) => d.status === "won").length;
      const dealsLost = deals.filter((d) => d.status === "lost").length;
      const totalRevenue = deals
        .filter((d) => d.status === "won")
        .reduce((sum, d) => sum + (d.value || 0), 0);
      const pipelineValue = deals
        .filter((d) => d.pipeline_stage !== "won" && d.pipeline_stage !== "lost" && d.status === "active")
        .reduce((sum, d) => sum + (d.value || 0), 0);

      const activityTypeMap: Record<string, number> = {};
      activities.forEach((a) => { activityTypeMap[a.type] = (activityTypeMap[a.type] || 0) + 1; });
      const activitiesByType = Object.entries(activityTypeMap).map(([name, value]) => ({ name, value }));

      const statusMap: Record<string, number> = {};
      customers.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
      const customersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      const monthShort = tArray("common.monthShort").length > 0 ? tArray("common.monthShort") : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthlyData = monthShort.map((month, i) => {
        const monthDeals = deals.filter((d) => {
          const dt = new Date(d.created_at);
          return dt.getFullYear() === currentYear && dt.getMonth() === i;
        });
        return {
          name: month,
          revenue: monthDeals.filter((d) => d.status === "won").reduce((sum, d) => sum + (d.value || 0), 0),
          deals: monthDeals.filter((d) => d.status === "won").length,
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
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 w-48 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse-soft" />
          <div className="h-4 w-64 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse-soft mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gradient-to-r from-muted to-muted/50 rounded-md animate-pulse-soft" />
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-muted to-muted/50 animate-pulse-soft" />
              </div>
              <div className="h-8 w-20 bg-gradient-to-r from-muted to-muted/50 rounded-md animate-pulse-soft" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="h-4 w-32 bg-gradient-to-r from-muted to-muted/50 rounded-md animate-pulse-soft mb-4" />
              <div className="h-48 w-full bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse-soft" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: t("dashboard.totalCustomers"), value: stats.totalCustomers, icon: Users, gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600" },
    { title: t("dashboard.newCustomers"), value: stats.newCustomers, icon: UserPlus, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600" },
    { title: t("dashboard.revenue"), value: formatCurrency(stats.totalRevenue), icon: DollarSign, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-600" },
    { title: t("dashboard.dealsWon"), value: stats.dealsWon, icon: TrendingUp, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600" },
    { title: t("dashboard.dealsLost"), value: stats.dealsLost, icon: TrendingDown, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-600" },
    { title: t("dashboard.followUpsToday"), value: stats.followUpsToday, icon: CalendarCheck, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600" },
    { title: t("dashboard.followUpsOverdue"), value: stats.followUpsOverdue, icon: AlertTriangle, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-600" },
    { title: t("dashboard.pipelineValue"), value: formatCurrency(stats.pipelineValue), icon: Package, gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1.5">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-slide-up border-border/50 overflow-hidden"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-3 sm:p-5 relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground/80 truncate uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
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
