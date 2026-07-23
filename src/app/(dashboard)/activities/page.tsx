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
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageSquare, Mail, MapPin, Monitor, Presentation, FileText, CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

interface Activity {
  id: string;
  customer_id: string;
  type: string;
  note: string;
  created_at: string;
  customer?: { name: string } | null;
  user?: { fullname: string } | null;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());
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
    try {
      const { data } = await supabase
        .from("activities")
        .select("*, customer:customers(name, deleted_at), user:profiles(fullname)")
        .order("created_at", { ascending: false })
        .limit(50);
      // Filter out activities for soft-deleted customers
      const filtered = (data || []).filter((a: any) => !a.customer || !a.customer.deleted_at);
      setActivities(filtered);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("activities.title")}</h1>
        <p className="text-muted-foreground mt-1.5">{t("activities.history")}</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-bold">{t("activities.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("activities.type")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("activities.customer")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("activities.note")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("activities.user")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("activities.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{t("activities.empty")}</TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => {
                    const cfg = typeConfig[a.type] || typeConfig.call;
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Badge variant={cfg.variant} className="font-medium gap-1.5">
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {a.customer?.name ? (
                            <Link href={`/customers/${(a as any).customer_id}`} className="hover:text-primary transition-colors">
                              {a.customer.name}
                            </Link>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-muted-foreground">{a.note}</TableCell>
                        <TableCell className="text-muted-foreground">{a.user?.fullname || "-"}</TableCell>
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
