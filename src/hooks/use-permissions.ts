"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasPermission, getAccessibleRoutes, type Role } from "@/lib/permissions";

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  role: Role;
}

export function usePermissions() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data as UserProfile | null);
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const checkPermission = (module: string, action: string) => {
    if (!profile) return false;
    return hasPermission(profile.role, module as keyof typeof import("@/lib/permissions").permissions, action);
  };

  const canAccess = (route: string) => {
    if (!profile) return false;
    const routes = getAccessibleRoutes(profile.role);
    return routes.includes(route);
  };

  return {
    profile,
    role: profile?.role || null,
    loading,
    checkPermission,
    canAccess,
    isAdmin: profile?.role === "admin",
    isManager: profile?.role === "manager",
    isSales: profile?.role === "sales",
  };
}
