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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";
import { useLanguage } from "@/components/language-provider";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
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

  const navItems = allNavItems.filter((item) =>
    accessibleRoutes.includes(item.href)
  );

  return (
    <aside
      className={cn(
        "no-print flex h-screen flex-col border-r border-border bg-card transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
          N
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-bold text-primary truncate">Nexus CRM</h1>
            <p className="text-xs text-muted-foreground truncate">Enterprise Edition</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8 shrink-0", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
