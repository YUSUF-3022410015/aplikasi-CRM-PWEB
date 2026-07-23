"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, Download, Upload } from "lucide-react";
import { exportCustomersToExcel } from "@/lib/excel";
import { ImportCustomersDialog } from "@/components/import-customers-dialog";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { logAudit } from "@/lib/audit";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import type { Customer } from "@/types/database";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  lead: "secondary",
  prospect: "warning",
  active: "success",
  inactive: "secondary",
  archived: "default",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { t } = useLanguage();
  const { isManager, isAdmin } = usePermissions();
  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        const safeSearch = search.replace(/[%_]/g, (m) => `\\${m}`);
        query = query.or(`name.ilike.%${safeSearch}%,company.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count } = await query.range(from, to);

      setCustomers(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, supabase]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const customer = customers.find(c => c.id === deleteId);
    const now = new Date().toISOString();
    // PRD §3.4: cascade soft delete — hide associated deals, activities, and follow-ups too
    await supabase.from("deals").update({ deleted_at: now }).eq("customer_id", deleteId).is("deleted_at", null);
    await supabase.from("activities").update({ deleted_at: now }).eq("customer_id", deleteId).is("deleted_at", null);
    await supabase.from("followups").delete().eq("customer_id", deleteId);
    await supabase.from("customers").update({ deleted_at: now }).eq("id", deleteId);
    if (customer) {
      logAudit("delete", "customers", deleteId, customer as unknown as Record<string, unknown>, null);
    }
    setDeleting(false);
    setDeleteId(null);
    fetchCustomers();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let query = supabase.from("customers").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (search) {
        const safeSearch = search.replace(/[%_]/g, (m) => `\\${m}`);
        query = query.or(`name.ilike.%${safeSearch}%,company.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data } = await query;
      if (!data?.length) return;

      const blob = exportCustomersToExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">{t("customers.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("customers.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="border-border shadow-sm">
            <Download className="mr-1.5 h-4 w-4" />
            {exporting ? t("common.loading") : t("common.export")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="border-border shadow-sm">
            <Upload className="mr-1.5 h-4 w-4" />
            {t("common.import")}
          </Button>
          {!isManager && (
            <Link href="/customers/new">
              <Button size="sm" className="shadow-sm">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("common.add")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("customers.searchPlaceholder")}
            className="pl-9 border-border/50 bg-background focus:border-primary/50 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] border-border/50 bg-background shadow-sm">
            <SelectValue placeholder={t("customers.filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("customers.allStatus")}</SelectItem>
            <SelectItem value="lead">{t("customers.lead")}</SelectItem>
            <SelectItem value="prospect">{t("customers.prospect")}</SelectItem>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
            <SelectItem value="archived">{t("customers.archived")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.name")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.company")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.email")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.phone")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.status")}</TableHead>
              <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">{t("common.edit")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon="users"
                    title={t("common.noData")}
                    description={t("customers.searchPlaceholder")}
                    actionLabel={t("common.add")}
                    actionHref="/customers/new"
                  />
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell className="font-semibold">
                    <Link href={`/customers/${customer.id}`} className="hover:text-primary transition-colors">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.company || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[customer.status] || "default"} className="font-medium capitalize">
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      {!isManager && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => router.push(`/customers/${customer.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteId(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card rounded-xl border border-border/50 px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">
            {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="shadow-sm"
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="shadow-sm"
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("customers.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("customers.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportCustomersDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
