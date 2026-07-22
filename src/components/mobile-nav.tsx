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
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

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

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Full-screen Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        style={{
          zIndex: 9998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease-out",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl"
        style={{
          zIndex: 9999,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shrink-0">
              N
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">Nexus CRM</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Enterprise Edition</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items - selalu tampilkan semua menu */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 56px)" }}>
          <div className="p-3 space-y-1">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
