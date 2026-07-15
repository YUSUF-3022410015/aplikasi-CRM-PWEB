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

const COLORS = ["#0058be", "#006947", "#4edea3", "#ba1a1a", "#8b5cf6", "#06b6d4"];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #c2c6d6",
  borderRadius: "8px",
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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      {/* Revenue Chart */}
      <Card className="md:col-span-2 border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold">{t("dashboard.monthlyRevenue")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
              <XAxis dataKey="name" fontSize={11} stroke="#424754" tick={{ fontSize: 11 }} />
              <YAxis fontSize={11} stroke="#424754" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#0058be" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deals Chart */}
      <Card className="md:col-span-2 border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold">{t("dashboard.monthlyDeals")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
              <XAxis dataKey="name" fontSize={11} stroke="#424754" tick={{ fontSize: 11 }} />
              <YAxis fontSize={11} stroke="#424754" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="#006947"
                strokeWidth={2}
                name={t("common.dealsWon")}
              />
              <Legend content={<CustomLegend />} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activities by Type */}
      {activitiesByType.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold">{t("dashboard.activitiesByType")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activitiesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="70%"
                  innerRadius="35%"
                  paddingAngle={2}
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
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold">{t("dashboard.customersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={customersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="70%"
                  innerRadius="35%"
                  paddingAngle={2}
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
