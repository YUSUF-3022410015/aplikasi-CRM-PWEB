"use client";

import { formatCurrency } from "@/lib/utils";
import type { Quotation, QuotationItem, Product, Customer } from "@/types/database";

interface QuotationPrintProps {
  quotation: Quotation & {
    customer?: Customer;
    items?: (QuotationItem & { product?: Product })[];
  };
}

export function QuotationPrint({ quotation }: QuotationPrintProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div id="quotation-print" className="hidden print:block print:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">CRM</h1>
          <p className="text-sm text-muted-foreground">Jl. Contoh No. 123, Jakarta</p>
          <p className="text-sm text-muted-foreground">Telp: 021-12345678</p>
          <p className="text-sm text-muted-foreground">Email: info@crm.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">QUOTATION</h2>
          <p className="text-sm text-muted-foreground">{quotation.quotation_number}</p>
          <p className="text-sm text-muted-foreground">Tanggal: {today}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Kepada Yth:</h3>
        <p className="font-medium">{quotation.customer?.name || "-"}</p>
        <p className="text-sm text-muted-foreground">{quotation.customer?.company || ""}</p>
        <p className="text-sm text-muted-foreground">{quotation.customer?.email || ""}</p>
        <p className="text-sm text-muted-foreground">{quotation.customer?.phone || ""}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">No</th>
            <th className="border p-2 text-left">Produk</th>
            <th className="border p-2 text-center">Qty</th>
            <th className="border p-2 text-right">Harga</th>
            <th className="border p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items?.map((item, index) => (
            <tr key={item.id}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{item.product?.name || "-"}</td>
              <td className="border p-2 text-center">{item.qty}</td>
              <td className="border p-2 text-right">{formatCurrency(item.price)}</td>
              <td className="border p-2 text-right">{formatCurrency(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Pajak (11%)</span>
            <span>{formatCurrency(quotation.tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Diskon</span>
            <span>-{formatCurrency(quotation.discount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quotation.notes && (
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Catatan:</h3>
          <p className="text-sm">{quotation.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="mt-12 flex justify-between">
        <div className="text-center">
          <div className="h-20"></div>
          <div className="border-t w-40 pt-2">
            <p className="text-sm font-medium">Hormat Kami,</p>
          </div>
        </div>
        <div className="text-center">
          <div className="h-20"></div>
          <div className="border-t w-40 pt-2">
            <p className="text-sm font-medium">Customer,</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to trigger print
export function printQuotation() {
  window.print();
}
