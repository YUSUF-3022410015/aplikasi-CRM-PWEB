"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

interface MonthlyData {
  name: string;
  revenue: number;
  deals: number;
}

interface ActivityByType {
  name: string;
  value: number;
}

interface CustomerByStatus {
  name: string;
  value: number;
}

const COLORS = ["#2563eb", "#059669", "#34d399", "#dc2626", "#8b5cf6", "#06b6d4"];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
};

interface DashboardChartsProps {
  data: MonthlyData[];
  activitiesByType?: ActivityByType[];
  customersByStatus?: CustomerByStatus[];
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="truncate">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardCharts({ data, activitiesByType = [], customersByStatus = [] }: DashboardChartsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Revenue Chart */}
      <Card className="md:col-span-2 border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base sm:text-lg font-bold">{t("dashboard.monthlyRevenue")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pt-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deals Chart */}
      <Card className="md:col-span-2 border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base sm:text-lg font-bold">{t("dashboard.monthlyDeals")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pt-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name={t("common.dealsWon")}
              />
              <Legend content={<CustomLegend />} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activities by Type */}
      {activitiesByType.length > 0 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base sm:text-lg font-bold">{t("dashboard.activitiesByType")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={activitiesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {activitiesByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Customer by Status */}
      {customersByStatus.length > 0 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base sm:text-lg font-bold">{t("dashboard.customersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={customersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {customersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
