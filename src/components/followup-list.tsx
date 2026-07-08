"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FollowUpItem {
  id: string;
  title: string;
  due_date: string;
  status: string;
  note?: string;
  assigned_user?: { fullname: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "secondary" }> = {
  pending: { label: "Pending", variant: "default" },
  done: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export function FollowUpList({
  followups,
  customerId,
}: {
  followups: FollowUpItem[];
  customerId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("followups").insert({
      customer_id: customerId,
      assigned_to: user?.id || "",
      title: title.trim(),
      due_date: dueDate,
      note: note.trim() || null,
      status: "pending",
    });

    setTitle("");
    setDueDate("");
    setNote("");
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("followups").update({ status }).eq("id", id);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Follow-up
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jadwal Follow-up Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                placeholder="Judul follow-up"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Textarea
                placeholder="Catatan (opsional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !title.trim() || !dueDate}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {followups.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Belum ada follow-up</p>
      ) : (
        <div className="space-y-3">
          {followups.map((fu) => {
            const cfg = statusConfig[fu.status] || statusConfig.pending;
            return (
              <Card key={fu.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{fu.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(fu.due_date)}
                          {fu.assigned_user && ` - ${fu.assigned_user.fullname}`}
                        </p>
                        {fu.note && (
                          <p className="text-xs text-muted-foreground mt-1">{fu.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {fu.status === "pending" && (
                        <Select
                          value={fu.status}
                          onValueChange={(v) => handleStatusChange(fu.id, v)}
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
