"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarView } from "@/components/calendar-view";
import { useLanguage } from "@/components/language-provider";

export default function CalendarPage() {
  const { t } = useLanguage();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("followups")
        .select(`
          *,
          customer:customers(name)
        `)
        .order("due_date", { ascending: true });

      setFollowUps(data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.calendar")}</h1>
        <p className="text-muted-foreground">{t("followups.subtitle")}</p>
      </div>

      <CalendarView followUps={followUps} />
    </div>
  );
}
