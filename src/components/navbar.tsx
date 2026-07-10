"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Bell, Shield, Search, HelpCircle } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";
import { roleNames, type Role } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

interface NavbarProps {
  user?: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center w-full rounded-lg bg-muted border border-border px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-primary">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            type="text"
            placeholder={t("common.search") + "..."}
            className="w-full border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-4">
        <LanguageToggle />
        <ThemeToggle />
        {user?.id && <NotificationBell userId={user.id} />}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 border border-border overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                  {user ? getInitials(user.fullname) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullname || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@email.com"}
                </p>
                {user?.role && (
                  <Badge variant="outline" className="mt-1 w-fit text-[10px]">
                    <Shield className="mr-1 h-3 w-3" />
                    {roleNames[user.role as Role] || user.role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>{t("nav.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("nav.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
