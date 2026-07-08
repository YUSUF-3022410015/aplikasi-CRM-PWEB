"use client";

import { formatDate } from "@/lib/utils";
import type { Customer, Activity, FollowUp } from "@/types/database";

interface CustomerPrintProps {
  customer: Customer & {
    activities?: Activity[];
    followups?: FollowUp[];
  };
}

export function CustomerPrint({ customer }: CustomerPrintProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const typeLabels: Record<string, string> = {
    call: "Call",
    whatsapp: "WhatsApp",
    email: "Email",
    meeting: "Meeting",
    visit: "Visit",
    demo: "Demo",
    proposal: "Proposal",
    closing: "Closing",
  };

  return (
    <div id="customer-print" className="hidden print:block print:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">CRM</h1>
          <p className="text-sm text-muted-foreground">Customer Detail Report</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{customer.name}</h2>
          <p className="text-sm text-muted-foreground">Dicetak: {today}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Informasi Customer</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nama:</span>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Perusahaan:</span>
            <p className="font-medium">{customer.company || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium">{customer.email || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Telepon:</span>
            <p className="font-medium">{customer.phone || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">WhatsApp:</span>
            <p className="font-medium">{customer.whatsapp || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kota:</span>
            <p className="font-medium">{customer.city || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industri:</span>
            <p className="font-medium">{customer.industry || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Website:</span>
            <p className="font-medium">{customer.website || "-"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Alamat:</span>
            <p className="font-medium">{customer.address || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className="font-medium uppercase">{customer.status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Pipeline:</span>
            <p className="font-medium uppercase">{customer.pipeline_stage}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Sumber Lead:</span>
            <p className="font-medium">{customer.source || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Dibuat:</span>
            <p className="font-medium">{formatDate(customer.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Activities */}
      {customer.activities && customer.activities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Riwayat Aktivitas</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Tanggal</th>
                <th className="border p-2 text-left">Tipe</th>
                <th className="border p-2 text-left">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {customer.activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="border p-2">{formatDate(activity.created_at)}</td>
                  <td className="border p-2">{typeLabels[activity.type] || activity.type}</td>
                  <td className="border p-2">{activity.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Follow-ups */}
      {customer.followups && customer.followups.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Follow-up</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Tanggal</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {customer.followups.map((fu) => (
                <tr key={fu.id}>
                  <td className="border p-2">{formatDate(fu.due_date)}</td>
                  <td className="border p-2 uppercase">{fu.status}</td>
                  <td className="border p-2">{fu.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-xs text-muted-foreground text-center">
        Dokumen ini dihasilkan secara otomatis oleh CRM System
      </div>
    </div>
  );
}

export function printCustomer() {
  window.print();
}
