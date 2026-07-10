"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Trash2, FileText, Printer, Mail } from "lucide-react";
import { formatCurrency, generateQuotationNumber } from "@/lib/utils";
import { QuotationPrint, printQuotation } from "@/components/quotation-print";
import { sendQuotationEmailAction } from "@/app/actions/email";
import { useLanguage } from "@/components/language-provider";
import type { Quotation, Customer, Product } from "@/types/database";

const statusColors: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
  draft: "secondary",
  sent: "warning",
  approved: "success",
  rejected: "destructive",
  expired: "default",
};

interface QuotationItemForm {
  product_id: string;
  qty: number;
  price: number;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<QuotationItemForm[]>([{ product_id: "", qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(11);
  const [discount, setDiscount] = useState(0);
  const supabase = createClient();
  const { t } = useLanguage();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [qRes, cRes, pRes] = await Promise.all([
      supabase.from("quotations").select("*, customer:customers(name)").order("created_at", { ascending: false }),
      supabase.from("customers").select("*").order("name"),
      supabase.from("products").select("*").eq("status", "active").order("name"),
    ]);
    setQuotations(qRes.data || []);
    setCustomers(cRes.data || []);
    setProducts(pRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;

  const addItem = () => setItems([...items, { product_id: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof QuotationItemForm, value: string | number) => {
    const updated = [...items];
    if (field === "product_id") {
      updated[i] = { ...updated[i], product_id: value as string };
      const product = products.find((p) => p.id === value);
      if (product) updated[i].price = product.price;
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }
    setItems(updated);
  };

  const handleSave = async () => {
    if (!customerId || items.length === 0) return;
    const qNumber = generateQuotationNumber();
    const { data: q } = await supabase
      .from("quotations")
      .insert({
        customer_id: customerId,
        quotation_number: qNumber,
        subtotal,
        tax,
        discount,
        total,
        status: "draft",
      })
      .select()
      .single();

    if (q) {
      const qItems = items.map((item) => ({
        quotation_id: q.id,
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
      }));
      await supabase.from("quotation_items").insert(qItems);

      // Create notification for new quotation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const customerName = customers.find((c) => c.id === customerId)?.name || "Customer";
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Quotation Baru",
          message: `Quotation ${qNumber} untuk ${customerName} telah dibuat`,
          type: "quotation_sent",
          link: "/quotations",
        });
      }
    }
    setDialogOpen(false);
    setCustomerId("");
    setItems([{ product_id: "", qty: 1, price: 0 }]);
    setDiscount(0);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quotation_items").delete().eq("quotation_id", id);
    await supabase.from("quotations").delete().eq("id", id);
    fetchData();
  };

  const handleSendEmail = async (quotationId: string) => {
    const result = await sendQuotationEmailAction(quotationId);
    if (result.success) {
      alert("Email berhasil dikirim!");
    } else {
      alert(`Gagal mengirim email: ${result.error}`);
    }
  };

  const openDetail = async (q: Quotation) => {
    const { data: items } = await supabase
      .from("quotation_items")
      .select("*, product:products(name, sku)")
      .eq("quotation_id", q.id);
    setSelectedQuotation({ ...q, items: items || [] });
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("quotations.title")}</h1>
          <p className="text-muted-foreground">{t("quotations.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("quotations.createQuotation")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("quotations.number")}</TableHead>
              <TableHead>{t("quotations.customer")}</TableHead>
              <TableHead>{t("quotations.total")}</TableHead>
              <TableHead>{t("customers.status")}</TableHead>
              <TableHead className="w-[100px]">{t("common.edit")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">{t("common.loading")}</TableCell></TableRow>
            ) : quotations.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">{t("common.noData")}</TableCell></TableRow>
            ) : (
              quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm">{q.quotation_number}</TableCell>
                  <TableCell>{(q.customer as { name: string })?.name || "-"}</TableCell>
                  <TableCell>{formatCurrency(q.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[q.status] || "default"}>{q.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(q)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Quotation Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" /> Tambah Item
                </Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select value={item.product_id} onValueChange={(v) => updateItem(i, "product_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Produk" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    className="w-20"
                    value={item.qty}
                    onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                    min={1}
                  />
                  <Input
                    type="number"
                    className="w-32"
                    value={item.price}
                    onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                  />
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Diskon (IDR)</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Pajak (%)</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="h-9 flex items-center font-bold text-lg">{formatCurrency(total)}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!customerId}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedQuotation?.quotation_number}
            </DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {(selectedQuotation.customer as { name: string })?.name}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusColors[selectedQuotation.status]}>{selectedQuotation.status}</Badge></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedQuotation.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{(item.product as { name: string })?.name || "-"}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{formatCurrency(item.qty * item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right space-y-1 text-sm">
                <p>Subtotal: {formatCurrency(selectedQuotation.subtotal)}</p>
                <p>Tax: {formatCurrency(selectedQuotation.tax)}</p>
                <p>Diskon: -{formatCurrency(selectedQuotation.discount)}</p>
                <p className="text-lg font-bold">Total: {formatCurrency(selectedQuotation.total)}</p>
              </div>
              {/* Printable version - only shows when printing */}
              <QuotationPrint quotation={selectedQuotation} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t("common.close")}</Button>
            {selectedQuotation?.id && (
              <Button variant="outline" onClick={() => handleSendEmail(selectedQuotation.id)}>
                <Mail className="mr-2 h-4 w-4" />
                {t("quotations.sendEmail")}
              </Button>
            )}
            <Button variant="outline" onClick={printQuotation}>
              <Printer className="mr-2 h-4 w-4" />
              {t("quotations.printPDF")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
