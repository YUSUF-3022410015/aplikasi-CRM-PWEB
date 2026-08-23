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
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";
import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/utils";

interface FollowUpItem {
  id: string;
  note: string;
  due_date: string;
  status: string;
  customer_id: string;
  customer?: { name: string } | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [showFollowUpPopup, setShowFollowUpPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
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

  // Fetch follow-up count & details (FR5: badge reminder di sidebar)
  const fetchFollowUps = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("followups")
      .select("id, note, due_date, status, customer_id, customer:customers(name, deleted_at)")
      .eq("status", "pending")
      .lte("due_date", today);
    const filtered = (data || []).filter((f: any) => !f.customer || !f.customer.deleted_at);
    setFollowUpCount(filtered.length);
    setFollowUps(filtered.map((f: any) => ({
      ...f,
      customer: Array.isArray(f.customer) ? f.customer[0] : f.customer,
    })) as FollowUpItem[]);
  };

  useEffect(() => {
    fetchFollowUps();
    const interval = setInterval(fetchFollowUps, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowFollowUpPopup(false);
      }
    };
    if (showFollowUpPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFollowUpPopup]);

  // Close popup on route change
  useEffect(() => {
    setShowFollowUpPopup(false);
  }, [pathname]);

  const navItems = allNavItems.filter((item) =>
    accessibleRoutes.includes(item.href)
  );

  const handleFollowUpBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (followUpCount > 0) {
      setShowFollowUpPopup(!showFollowUpPopup);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <aside
      className={cn(
        "no-print relative z-10 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-slate-200",
        collapsed ? "justify-center px-2" : "gap-3 px-4"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white font-bold text-base shrink-0 shadow-sm">
          N
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 truncate">Nexus CRM</h1>
            <p className="text-[10px] text-slate-500 truncate font-medium">Enterprise Edition</p>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
            const isFollowUp = item.href === "/followups";
            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                    collapsed && "relative justify-center px-2 py-2.5",
                    isActive
                      ? "bg-blue-600/10 text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-blue-600")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && isFollowUp && followUpCount > 0 && (
                    <button
                      type="button"
                      onClick={handleFollowUpBadgeClick}
                      className="ml-auto cursor-pointer"
                    >
                      <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
                        {followUpCount > 9 ? "9+" : followUpCount}
                      </Badge>
                    </button>
                  )}
                  {collapsed && isFollowUp && followUpCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white shadow-sm cursor-pointer"
                      onClick={handleFollowUpBadgeClick}
                    >
                      {followUpCount > 9 ? "9+" : followUpCount}
                    </span>
                  )}
                </Link>

                {/* Follow-up Popup */}
                {isFollowUp && showFollowUpPopup && !collapsed && (
                  <div
                    ref={popupRef}
                    className="absolute left-full top-0 ml-2 w-80 max-h-[70vh] bg-white rounded-xl border border-slate-200 shadow-xl shadow-black/10 z-50 overflow-hidden animate-scale-in"
                  >
                    {/* Popup Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <h3 className="text-sm font-bold text-slate-900">{t("nav.followups")}</h3>
                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-red-600 text-white">
                          {followUpCount}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFollowUpPopup(false)}
                        className="p-1 rounded-md hover:bg-slate-200 transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>

                    {/* Popup Content */}
                    <div className="overflow-y-auto max-h-[55vh] divide-y divide-slate-100">
                      {followUps.length === 0 ? (
                        <div className="p-6 text-center">
                          <CalendarCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">{t("common.noFollowups")}</p>
                        </div>
                      ) : (
                        followUps.map((fu) => {
                          const isOverdue = fu.due_date?.split("T")[0] < today;
                          return (
                            <Link
                              key={fu.id}
                              href={`/customers/${fu.customer_id}`}
                              onClick={() => setShowFollowUpPopup(false)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                            >
                              <div className={cn(
                                "mt-0.5 p-1.5 rounded-lg shrink-0",
                                isOverdue ? "bg-red-100" : "bg-amber-100"
                              )}>
                                <Clock className={cn(
                                  "h-3.5 w-3.5",
                                  isOverdue ? "text-red-600" : "text-amber-600"
                                )} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {fu.customer?.name || t("customers.title")}
                                </p>
                                {fu.note && (
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {fu.note}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className={cn(
                                    "text-[11px] font-medium",
                                    isOverdue ? "text-red-600" : "text-amber-600"
                                  )}>
                                    {isOverdue ? t("followups.overdue") : t("followups.pending")}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {formatDate(fu.due_date)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>

                    {/* Popup Footer */}
                    {followUps.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                        <Link
                          href="/followups"
                          onClick={() => setShowFollowUpPopup(false)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {t("common.viewAll")} →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
