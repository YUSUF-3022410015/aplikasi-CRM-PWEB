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
import { Phone, MessageSquare, Mail, MapPin, Monitor, Presentation, FileText, CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  note: string;
  created_at: string;
  customer?: { name: string } | null;
  user?: { fullname: string } | null;
}

const typeConfig: Record<string, { icon: typeof Phone; label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" }> = {
  call: { icon: Phone, label: "Call", variant: "info" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp", variant: "success" },
  email: { icon: Mail, label: "Email", variant: "default" },
  meeting: { icon: Monitor, label: "Meeting", variant: "warning" },
  visit: { icon: MapPin, label: "Visit", variant: "secondary" },
  demo: { icon: Presentation, label: "Demo", variant: "info" },
  proposal: { icon: FileText, label: "Proposal", variant: "default" },
  closing: { icon: CheckCircle, label: "Closing", variant: "success" },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("activities")
      .select("*, customer:customers(name), user:profiles(fullname)")
      .order("created_at", { ascending: false })
      .limit(50);
    setActivities(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">Riwayat semua aktivitas komunikasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Memuat data...</TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Belum ada aktivitas</TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => {
                    const cfg = typeConfig[a.type] || typeConfig.call;
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>{a.customer?.name || "-"}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{a.note}</TableCell>
                        <TableCell>{a.user?.fullname || "-"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTime(a.created_at)}
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
