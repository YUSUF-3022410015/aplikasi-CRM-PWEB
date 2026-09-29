"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarView } from "@/components/calendar-view";
import { useLanguage } from "@/components/language-provider";

interface FollowUpRaw {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer_id: string;
  customer?: { name: string; deleted_at?: string | null } | { name: string; deleted_at?: string | null }[] | null;
}

interface FollowUpRow {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer_id: string;
  customer?: { name: string } | null;
}

export default function CalendarPage() {
  const { t } = useLanguage();
  const [followUps, setFollowUps] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("followups")
          .select(`
            *,
            customer:customers(name)
          `)
          .order("due_date", { ascending: true });

        const rows = (data || []) as unknown as FollowUpRaw[];
        setFollowUps(
          rows.map((f) => {
            const c = Array.isArray(f.customer) ? f.customer[0] : f.customer;
            return { ...f, customer: c ? { name: c.name } : null };
          })
        );
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    const run = async () => {
      await fetchData();
    };
    void run();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-500">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.calendar")}</h1>
        <p className="text-slate-500">{t("followups.subtitle")}</p>
      </div>

      <CalendarView followUps={followUps} />
    </div>
  );
}
