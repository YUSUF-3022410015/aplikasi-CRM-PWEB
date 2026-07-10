"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { ActivityLogList } from "@/components/activity-log-list";

export default function ActivityLogPage() {
  const { t } = useLanguage();
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      // Fetch all activities with user info
      const { data: activities } = await supabase
        .from("activities")
        .select(`
          id,
          type,
          note,
          created_at,
          user:profiles(fullname),
          customer:customers(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      // Fetch quotations for quotation activities
      const { data: quotations } = await supabase
        .from("quotations")
        .select("id, quotation_number, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch follow-ups
      const { data: followups } = await supabase
        .from("followups")
        .select("id, note, due_date, status, created_at, customer:customers(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch notifications
      const { data: { user } } = await supabase.auth.getUser();
      const { data: notifications } = await supabase
        .from("notifications")
        .select("id, title, message, type, created_at")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(50);

      // Combine and format all activities
      const combined = [
        // Activities
        ...(activities || []).map((a) => {
          const cust = (a.customer ?? null) as unknown as { name: string } | null;
          const usr = (a.user ?? null) as unknown as { fullname: string } | null;
          return {
            id: a.id,
            type: a.type,
            description: `${a.note || t("activityLog.title")} - ${cust?.name || "Customer"}`,
            module: "customer",
            user: usr?.fullname || "",
            created_at: a.created_at,
          };
        }),
        // Quotations
        ...(quotations || []).map((q) => ({
          id: `q-${q.id}`,
          type: "quotation_created",
          description: `Quotation ${q.quotation_number} - ${q.status} - Rp ${q.total?.toLocaleString("id-ID") || 0}`,
          module: "quotation",
          user: "",
          created_at: q.created_at,
        })),
        // Follow-ups
        ...(followups || []).map((f) => {
          const cust = (f.customer ?? null) as unknown as { name: string } | null;
          return {
            id: `fu-${f.id}`,
            type: "followup_created",
            description: `Follow-up ${cust?.name || "Customer"} - ${f.status} - Jatuh tempo: ${new Date(f.due_date).toLocaleDateString("id-ID")}`,
            module: "followup",
            user: "",
            created_at: f.created_at,
          };
        }),
        // Notifications
        ...(notifications || []).map((n) => ({
          id: `n-${n.id}`,
          type: "notification",
          description: `${n.title} - ${n.message}`,
          module: "notification",
          user: "",
          created_at: n.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllActivities(combined);
      setLoading(false);
    };

    fetchData();
  }, [t]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("activityLog.title")}</h1>
        <p className="text-muted-foreground">{t("activityLog.subtitle")}</p>
      </div>

      <ActivityLogList activities={allActivities} />
    </div>
  );
}
