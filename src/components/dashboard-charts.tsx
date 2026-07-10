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
import { formatCurrency } from "@/lib/utils";
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

interface DashboardChartsProps {
  data: MonthlyData[];
  activitiesByType?: ActivityByType[];
  customersByStatus?: CustomerByStatus[];
}

export function DashboardCharts({ data, activitiesByType = [], customersByStatus = [] }: DashboardChartsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
      {/* Revenue Chart */}
      <Card className="lg:col-span-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("dashboard.monthlyRevenue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
              <XAxis dataKey="name" fontSize={12} stroke="#424754" />
              <YAxis fontSize={12} stroke="#424754" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #c2c6d6",
                  borderRadius: "8px",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Bar dataKey="revenue" fill="#0058be" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deals Chart */}
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("dashboard.monthlyDeals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
              <XAxis dataKey="name" fontSize={12} stroke="#424754" />
              <YAxis fontSize={12} stroke="#424754" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #c2c6d6",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="#006947"
                strokeWidth={2}
                name={t("common.dealsWon")}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activities by Type */}
      {activitiesByType.length > 0 && (
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("dashboard.activitiesByType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activitiesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {activitiesByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c2c6d6",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Customer by Status */}
      {customersByStatus.length > 0 && (
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("dashboard.customersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={customersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {customersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c2c6d6",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
