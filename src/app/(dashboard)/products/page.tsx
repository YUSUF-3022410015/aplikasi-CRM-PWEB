"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import type { Product } from "@/types/database";

export default function ProductsPage() {
  const { t } = useLanguage();
  const { isAdmin } = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", category: "", price: 0, description: "", status: "active" as "active" | "inactive" });
  const [supabase] = useState(() => createClient());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ sku: "", name: "", category: "", price: 0, description: "", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ sku: p.sku, name: p.name, category: p.category, price: p.price, description: p.description || "", status: p.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (editProduct) {
      await supabase.from("products").update(form).eq("id", editProduct.id);
      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Produk Diperbarui",
          message: `Produk ${form.name} telah diperbarui`,
          type: "activity_added",
          link: "/products",
        }).maybeSingle();
      }
    } else {
      await supabase.from("products").insert(form);
      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Produk Baru",
          message: `Produk ${form.name} berhasil ditambahkan`,
          type: "activity_added",
          link: "/products",
        }).maybeSingle();
      }
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const product = products.find((p) => p.id === id);
    await supabase.from("products").delete().eq("id", id);
    if (user && product) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Produk Dihapus",
        message: `Produk ${product.name} telah dihapus`,
        type: "activity_added",
        link: "/products",
      }).maybeSingle();
    }
    fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">{t("products.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("products.subtitle")}</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("products.addProduct")}
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("products.sku")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("products.name")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("products.category")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("products.price")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("products.status")}</TableHead>
                <TableHead className="w-[100px] font-semibold text-xs uppercase tracking-wider">{t("products.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">{t("common.loading")}</TableCell>
                </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">{t("products.noProducts")}</TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-mono text-sm text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category || "-"}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(p.price)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "success" : "secondary"} className="font-medium capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{editProduct ? t("products.editProduct") : t("products.addProduct")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" className="bg-muted/50 focus:bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("products.status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                  <SelectTrigger className="bg-muted/50 focus:bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("common.active")}</SelectItem>
                    <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("products.name")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("customers.name")} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("products.category")}</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t("products.category")} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("products.price")} (IDR)</Label>
              <Input type="text" inputMode="numeric" value={form.price === 0 ? "" : form.price} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setForm({ ...form, price: val ? Number(val) : 0 }); }} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("products.description")}</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-muted/50 focus:bg-background resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
