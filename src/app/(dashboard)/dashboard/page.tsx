import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, CalendarCheck, DollarSign, AlertTriangle, Package, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard-charts";

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
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

  return {
    totalCustomers: customersRes.count || 0,
    newCustomers: newCustomersThisMonth,
    totalRevenue,
    dealsWon,
    dealsLost,
    followUpsToday,
    followUpsOverdue,
    pipelineValue,
    recentActivities: activities.slice(0, 5),
    monthlyData: getMonthlyData(quotations),
  };
}

function getMonthlyData(quotations: { created_at: string; total: number; status: string }[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const currentYear = new Date().getFullYear();

  return months.map((month, i) => {
    const monthQuotations = quotations.filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    });
    return {
      name: month,
      revenue: monthQuotations
        .filter((q) => q.status === "approved")
        .reduce((sum, q) => sum + (q.total || 0), 0),
      deals: monthQuotations.filter((q) => q.status === "approved").length,
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  const statCards = [
    { title: "Total Customer", value: stats.totalCustomers, icon: Users, color: "text-blue-600" },
    { title: "Customer Baru", value: stats.newCustomers, icon: UserPlus, color: "text-green-600" },
    { title: "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600" },
    { title: "Deal Won", value: stats.dealsWon, icon: TrendingUp, color: "text-green-600" },
    { title: "Deal Lost", value: stats.dealsLost, icon: AlertTriangle, color: "text-red-600" },
    { title: "Follow-up Hari Ini", value: stats.followUpsToday, icon: CalendarCheck, color: "text-orange-600" },
    { title: "Follow-up Overdue", value: stats.followUpsOverdue, icon: AlertTriangle, color: "text-red-600" },
    { title: "Pipeline Value", value: formatCurrency(stats.pipelineValue), icon: Package, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas dan performa penjualan</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DashboardCharts data={stats.monthlyData} />
    </div>
  );
}
