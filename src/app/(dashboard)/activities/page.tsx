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

interface ActivityRow {
  id: string;
  customer_id: string;
  type: string;
  note: string;
  created_at: string;
  customer?: { name: string } | null;
  user?: { fullname: string } | null;
}

// Bentuk mentah dari Supabase: relasi bisa berupa objek tunggal atau array.
interface ActivityRaw extends Omit<ActivityRow, "customer" | "user"> {
  customer?: { name: string; deleted_at?: string | null } | { name: string; deleted_at?: string | null }[] | null;
  user?: { fullname: string } | { fullname: string }[] | null;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
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
      const { data, error } = await supabase
        .from("activities")
        .select("*, customer:customers(name, deleted_at), user:profiles(fullname)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      // Filter out activities for soft-deleted customers
      const rows = (data || []) as unknown as ActivityRaw[];
      const filtered: ActivityRow[] = rows
        .filter((a) => {
          const c = Array.isArray(a.customer) ? a.customer[0] : a.customer;
          return !c || !c.deleted_at;
        })
        .map((a) => {
          const c = Array.isArray(a.customer) ? a.customer[0] : a.customer;
          const u = Array.isArray(a.user) ? a.user[0] : a.user;
          return {
            ...a,
            customer: c ? { name: c.name } : null,
            user: u ? { fullname: u.fullname } : null,
          };
        });
      setActivities(filtered);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const run = async () => {
      await fetchActivities();
    };
    void run();
  }, [fetchActivities]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("activities.title")}</h1>
        <p className="text-slate-500 mt-1.5">{t("activities.history")}</p>
      </div>

      <Card className="border-slate-200/50 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-200/50 pb-3">
          <CardTitle className="text-base font-bold">{t("activities.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-slate-100/50">
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
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">{t("activities.empty")}</TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => {
                    const cfg = typeConfig[a.type] || typeConfig.call;
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={a.id} className="hover:bg-slate-100/30 transition-colors">
                        <TableCell>
                          <Badge variant={cfg.variant} className="font-medium gap-1.5">
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {a.customer?.name ? (
                            <Link href={`/customers/${a.customer_id}`} className="hover:text-blue-600 transition-colors">
                              {a.customer.name}
                            </Link>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-slate-500">{a.note}</TableCell>
                        <TableCell className="text-slate-500">{a.user?.fullname || "-"}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
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
