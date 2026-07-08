"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CalendarCheck, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FollowUpItem {
  id: string;
  customer_id: string;
  note: string;
  due_date: string;
  status: string;
  customer?: { name: string } | null;
}

interface CalendarViewProps {
  followUps: FollowUpItem[];
  onDateClick?: (date: string) => void;
  onFollowUpClick?: (followUp: FollowUpItem) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-orange-100 text-orange-700 border-orange-300" },
  done: { label: "Done", color: "bg-green-100 text-green-700 border-green-300" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700 border-gray-300" },
};

const daysInWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function CalendarView({ followUps, onDateClick, onFollowUpClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [daysInMonth, firstDayOfMonth]);

  // Group follow-ups by date
  const followUpsByDate = useMemo(() => {
    const grouped: Record<string, FollowUpItem[]> = {};
    followUps.forEach((fu) => {
      const dateKey = fu.due_date.split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(fu);
    });
    return grouped;
  }, [followUps]);

  // Get follow-ups for selected date
  const selectedDateFollowUps = useMemo(() => {
    if (!selectedDate) return [];
    return followUpsByDate[selectedDate] || [];
  }, [selectedDate, followUpsByDate]);

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setShowDetail(true);
    onDateClick?.(dateKey);
  };

  const handleFollowUpClick = (fu: FollowUpItem) => {
    onFollowUpClick?.(fu);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {months[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted">
          {daysInWeek.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="border-b border-r min-h-[100px] bg-muted/30" />;
            }

            const dateKey = formatDateKey(day);
            const dayFollowUps = followUpsByDate[dateKey] || [];
            const hasPending = dayFollowUps.some((fu) => fu.status === "pending");

            return (
              <div
                key={day}
                className={`border-b border-r min-h-[100px] p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isToday(day) ? "bg-blue-50" : ""
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday(day) ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
                    }`}
                  >
                    {day}
                  </span>
                  {hasPending && (
                    <Clock className="h-3 w-3 text-orange-500" />
                  )}
                </div>

                {/* Follow-up indicators */}
                <div className="space-y-1">
                  {dayFollowUps.slice(0, 2).map((fu) => {
                    const config = statusConfig[fu.status] || statusConfig.pending;
                    return (
                      <div
                        key={fu.id}
                        className={`text-[10px] px-1 py-0.5 rounded border truncate ${config.color}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowUpClick(fu);
                        }}
                      >
                        {fu.customer?.name || "Follow-up"}
                      </div>
                    );
                  })}
                  {dayFollowUps.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayFollowUps.length - 2} lagi
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              {selectedDate && formatDate(selectedDate)}
            </DialogTitle>
          </DialogHeader>

          {selectedDateFollowUps.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CalendarCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Tidak ada follow-up pada tanggal ini</p>
              {onDateClick && (
                <Button
                  variant="link"
                  onClick={() => {
                    setShowDetail(false);
                    onDateClick(selectedDate!);
                  }}
                >
                  Tambah follow-up baru
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateFollowUps.map((fu) => {
                const config = statusConfig[fu.status] || statusConfig.pending;
                return (
                  <div
                    key={fu.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => handleFollowUpClick(fu)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{fu.customer?.name || "Follow-up"}</p>
                        <p className="text-sm text-muted-foreground">{fu.note || "Tidak ada catatan"}</p>
                      </div>
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
