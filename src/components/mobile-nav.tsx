"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { usePermissions } from "@/hooks/use-permissions";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";

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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { role } = usePermissions();

  const navItems = role
    ? allNavItems.filter((item) => {
        const routes = getAccessibleRoutes(role as Role);
        return routes.some((r) => item.href === r || item.href.startsWith(r + "/"));
      })
    : [];

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 2147483640,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease-out",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          backgroundColor: "#ffffff",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
          zIndex: 2147483641,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          padding: "0 16px",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              N
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>Nexus CRM</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Enterprise Edition</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: "12px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="active:animate-[shake-bottom_0.8s_cubic-bezier(0.455,0.03,0.515,0.955)]"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  marginBottom: "4px",
                  backgroundColor: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "#ffffff" : "#475569",
                  boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#64748b",
        }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Render sidebar via Portal to escape navbar stacking context */}
      {mounted && createPortal(sidebarContent, document.body)}
    </div>
  );
}
