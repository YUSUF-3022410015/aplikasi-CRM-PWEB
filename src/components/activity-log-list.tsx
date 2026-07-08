"use client";

import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Monitor,
  Presentation,
  FileText,
  CheckCircle,
  UserPlus,
  ShoppingCart,
  CalendarCheck,
  Bell,
} from "lucide-react";

interface ActivityLogItem {
  id: string;
  type: string;
  description: string;
  module: string;
  user?: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Phone; label: string; color: string }> = {
  call: { icon: Phone, label: "Call", color: "bg-blue-100 text-blue-700" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp", color: "bg-green-100 text-green-700" },
  email: { icon: Mail, label: "Email", color: "bg-purple-100 text-purple-700" },
  meeting: { icon: Monitor, label: "Meeting", color: "bg-orange-100 text-orange-700" },
  visit: { icon: MapPin, label: "Visit", color: "bg-yellow-100 text-yellow-700" },
  demo: { icon: Presentation, label: "Demo", color: "bg-cyan-100 text-cyan-700" },
  proposal: { icon: FileText, label: "Proposal", color: "bg-indigo-100 text-indigo-700" },
  closing: { icon: CheckCircle, label: "Closing", color: "bg-emerald-100 text-emerald-700" },
  customer_created: { icon: UserPlus, label: "Customer Baru", color: "bg-blue-100 text-blue-700" },
  quotation_created: { icon: ShoppingCart, label: "Quotation", color: "bg-purple-100 text-purple-700" },
  followup_created: { icon: CalendarCheck, label: "Follow-up", color: "bg-orange-100 text-orange-700" },
  notification: { icon: Bell, label: "Notifikasi", color: "bg-gray-100 text-gray-700" },
};

const moduleColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  customer: "default",
  activity: "secondary",
  followup: "warning",
  quotation: "success",
  notification: "destructive",
};

export function ActivityLogList({ activities }: { activities: ActivityLogItem[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">Belum ada activity log</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = typeConfig[activity.type] || typeConfig.call;
        const Icon = config.icon;
        return (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-2 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{config.label}</Badge>
                    <Badge variant={moduleColors[activity.module] || "default"} className="text-xs">
                      {activity.module}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-muted-foreground">oleh {activity.user}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
