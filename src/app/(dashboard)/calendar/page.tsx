import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();

  // Get all follow-ups with customer info
  const { data: followUps } = await supabase
    .from("followups")
    .select(`
      *,
      customer:customers(name)
    `)
    .order("due_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Jadwal follow-up dan meetings</p>
      </div>

      <CalendarView followUps={followUps || []} />
    </div>
  );
}
