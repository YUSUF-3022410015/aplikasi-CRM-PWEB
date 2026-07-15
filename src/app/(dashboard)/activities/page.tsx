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
import { useLanguage } from "@/components/language-provider";

interface Activity {
  id: string;
  type: string;
  note: string;
  created_at: string;
  customer?: { name: string } | null;
  user?: { fullname: string } | null;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { t } = useLanguage();

  const typeConfig: Record<string, { icon: typeof Phone; label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
    call: { icon: Phone, label: t("activities.call"), variant: "secondary" },
    whatsapp: { icon: MessageSquare, label: t("activities.whatsapp"), variant: "success" },
    email: { icon: Mail, label: t("activities.email"), variant: "default" },
    meeting: { icon: Monitor, label: t("activities.meeting"), variant: "warning" },
    visit: { icon: MapPin, label: t("activities.visit"), variant: "secondary" },
    demo: { icon: Presentation, label: t("activities.demo"), variant: "default" },
    proposal: { icon: FileText, label: t("activities.proposal"), variant: "default" },
    closing: { icon: CheckCircle, label: t("activities.closing"), variant: "success" },
  };

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
        <h1 className="text-2xl font-bold tracking-tight">{t("activities.title")}</h1>
        <p className="text-muted-foreground">{t("activities.history")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("activities.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("activities.type")}</TableHead>
                  <TableHead>{t("activities.customer")}</TableHead>
                  <TableHead>{t("activities.note")}</TableHead>
                  <TableHead>{t("activities.user")}</TableHead>
                  <TableHead>{t("activities.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">{t("activities.empty")}</TableCell>
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
