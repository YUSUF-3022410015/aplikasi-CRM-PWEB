"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
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
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/customers", icon: Users, labelKey: "nav.customers" },
  { href: "/activities", icon: Phone, labelKey: "nav.activities" },
  { href: "/followups", icon: CalendarCheck, labelKey: "nav.followups" },
  { href: "/calendar", icon: Calendar, labelKey: "nav.calendar" },
  { href: "/pipeline", icon: Kanban, labelKey: "nav.pipeline" },
  { href: "/products", icon: Package, labelKey: "nav.products" },
  { href: "/quotations", icon: FileText, labelKey: "nav.quotations" },
  { href: "/activity-log", icon: Activity, labelKey: "nav.activityLog" },
  { href: "/reports", icon: BarChart3, labelKey: "nav.reports" },
  { href: "/users", icon: UserCog, labelKey: "nav.users" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const [supabase] = useState(() => createClient());

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = allNavItems.filter((item) => accessibleRoutes.includes(item.href));

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-all duration-300 ease-out shadow-xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              N
            </div>
            <div>
              <h1 className="text-base font-bold text-primary">Nexus CRM</h1>
              <p className="text-xs text-muted-foreground">Enterprise Edition</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="active:scale-90 transition-transform">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={{
                  animation: open ? `slide-up 0.2s ease-out ${index * 30}ms both` : undefined,
                }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
