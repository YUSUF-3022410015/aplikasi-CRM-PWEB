"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";

interface FollowUp {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer?: { name: string } | null;
  assigned_user?: { fullname: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> = {
  pending: { label: "Pending", variant: "default" },
  done: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("followups")
      .select("*, customer:customers(name)")
      .order("due_date", { ascending: true })
      .limit(100);
    setFollowups(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = new Date().toISOString().split("T")[0];
  const pendingCount = followups.filter((f) => f.status === "pending").length;
  const overdueCount = followups.filter((f) => f.status === "pending" && f.due_date < today).length;
  const doneCount = followups.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
        <p className="text-muted-foreground">Jadwal follow-up dan pengingat pelanggan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CalendarCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CalendarCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Memuat data...</TableCell>
                  </TableRow>
                ) : followups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Belum ada follow-up</TableCell>
                  </TableRow>
                ) : (
                  followups.map((f) => {
                    const cfg = statusConfig[f.status] || statusConfig.pending;
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.note || "-"}</TableCell>
                        <TableCell>{f.customer?.name || "-"}</TableCell>
                        <TableCell>{formatDate(f.due_date)}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
