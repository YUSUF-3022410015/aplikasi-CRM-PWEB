"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  CalendarCheck,
  Calendar,
  Kanban,
  Package,
  FileText,
  BarChart3,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";
import { useLanguage } from "@/components/language-provider";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [supabase] = useState(() => createClient());
  const { t } = useLanguage();

  const allNavItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/customers", label: t("nav.customers"), icon: Users },
    { href: "/activities", label: t("nav.activities"), icon: Phone },
    { href: "/followups", label: t("nav.followups"), icon: CalendarCheck },
    { href: "/calendar", label: t("nav.calendar"), icon: Calendar },
    { href: "/pipeline", label: t("nav.pipeline"), icon: Kanban },
    { href: "/products", label: t("nav.products"), icon: Package },
    { href: "/quotations", label: t("nav.quotations"), icon: FileText },
    { href: "/activity-log", label: t("nav.activityLog"), icon: Activity },
    { href: "/reports", label: t("nav.reports"), icon: BarChart3 },
    { href: "/users", label: t("nav.users"), icon: UserCog },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        const routes = getAccessibleRoutes(profile.role as Role);
        setAccessibleRoutes(routes);
      }
    };

    fetchRole();
  }, []);

  // Fetch follow-up count (FR5: badge reminder di sidebar)
  useEffect(() => {
    const fetchFollowUpCount = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("followups")
        .select("id, customer:customers(deleted_at)")
        .eq("status", "pending")
        .lte("due_date", today);
      // Filter out followups for soft-deleted customers
      const count = (data || []).filter((f: any) => !f.customer || !f.customer.deleted_at).length;
      setFollowUpCount(count);
    };

    fetchFollowUpCount();
    const interval = setInterval(fetchFollowUpCount, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  const navItems = allNavItems.filter((item) =>
    accessibleRoutes.includes(item.href)
  );

  return (
    <aside
      className={cn(
        "no-print relative z-10 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-slate-200-border",
        collapsed ? "justify-center px-2" : "gap-3 px-4"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white font-bold text-base shrink-0 shadow-sm">
          N
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 truncate">Nexus CRM</h1>
            <p className="text-[10px] text-slate-900/50 truncate font-medium">Enterprise Edition</p>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-slate-900/40 hover:text-slate-900 hover:bg-white-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-200-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-900/40 hover:text-slate-900 hover:bg-white-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] active:animate-[shake-bottom_0.8s_cubic-bezier(0.455,0.03,0.515,0.955)]",
                  collapsed && "relative justify-center px-2 py-2.5",
                  isActive
                    ? "bg-white-primary/10 text-slate-900-primary shadow-sm"
                    : "text-slate-900/60 hover:bg-white-accent hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-slate-900-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.href === "/followups" && followUpCount > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-white-primary text-slate-900-primary-foreground">
                    {followUpCount > 9 ? "9+" : followUpCount}
                  </Badge>
                )}
                {collapsed && item.href === "/followups" && followUpCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-red-600-foreground shadow-sm">
                    {followUpCount > 9 ? "9+" : followUpCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
