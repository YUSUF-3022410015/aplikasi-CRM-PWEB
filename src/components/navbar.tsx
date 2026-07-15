"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield, Search, X, Users, FileText, Phone } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNav } from "@/components/mobile-nav";
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

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "customer" | "quotation" | "activity";
}

interface NavbarProps {
  user?: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  } | null;
}

const typeIcon = {
  customer: Users,
  quotation: FileText,
  activity: Phone,
};

const typeColor = {
  customer: "text-primary",
  quotation: "text-amber-600",
  activity: "text-emerald-600",
};

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    const pattern = `%${q}%`;
    const results: SearchResult[] = [];

    try {
      // Search customers by name, company, or email
      const { data: customers, error: custErr } = await supabase
        .from("customers")
        .select("id, name, company, email")
        .or(`name.ilike.${pattern},company.ilike.${pattern},email.ilike.${pattern}`)
        .limit(5);

      if (custErr) {
        console.error("Search customers error:", custErr.message, custErr);
      }

      (customers || []).forEach((c) => {
        results.push({
          id: c.id,
          title: c.name,
          subtitle: c.company || c.email || "",
          href: `/customers/${c.id}`,
          type: "customer",
        });
      });

      // Search quotations by number
      const { data: quotations, error: quotErr } = await supabase
        .from("quotations")
        .select("id, quotation_number, status")
        .ilike("quotation_number", pattern)
        .limit(3);

      if (quotErr) {
        console.error("Search quotations error:", quotErr);
      }

      (quotations || []).forEach((q) => {
        results.push({
          id: q.id,
          title: q.quotation_number,
          subtitle: q.status,
          href: "/quotations",
          type: "quotation",
        });
      });
    } catch (err) {
      console.error("Search failed:", err);
    }

    setSearchResults(results);
    setShowResults(true);
    setSearching(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-3 md:px-6">
      <MobileNav />

      {/* Search Bar with Results */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative flex items-center w-full rounded-lg bg-muted border border-border px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-primary">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            type="text"
            placeholder={t("common.search") + "..."}
            className="w-full border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="shrink-0">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-slide-down z-50">
            {searching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Mencari...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada hasil untuk &quot;{searchQuery}&quot;</div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {searchResults.map((r) => {
                  const Icon = typeIcon[r.type];
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => {
                        router.push(r.href);
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${typeColor[r.type]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{r.type}</Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-4">
        <LanguageToggle />
        {user?.id && <NotificationBell userId={user.id} />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 md:ml-2 border border-border overflow-hidden">
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
                <p className="text-sm font-medium leading-none">{user?.fullname || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@email.com"}</p>
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
