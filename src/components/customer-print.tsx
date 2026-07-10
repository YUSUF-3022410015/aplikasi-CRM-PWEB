"use client";

import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

interface CustomerPrintCustomer {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  industry?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  source?: string | null;
  status: string;
  pipeline_stage: string;
  created_at: string;
  updated_at: string;
  activities?: { id: string; type: string; note: string; created_at: string; user?: { fullname: string } | null }[];
  followups?: { id: string; note?: string; due_date: string; status: string }[];
}

interface CustomerPrintProps {
  customer: CustomerPrintCustomer;
}

export function CustomerPrint({ customer }: CustomerPrintProps) {
  const { t } = useLanguage();
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const typeLabels: Record<string, string> = {
    call: t("activities.call"),
    whatsapp: t("activities.whatsapp"),
    email: t("activities.email"),
    meeting: t("activities.meeting"),
    visit: t("activities.visit"),
    demo: t("activities.demo"),
    proposal: t("activities.proposal"),
    closing: t("activities.closing"),
  };

  return (
    <div id="customer-print" className="hidden print:block print:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">CRM</h1>
          <p className="text-sm text-muted-foreground">{t("print.customerDetailReport")}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{customer.name}</h2>
          <p className="text-sm text-muted-foreground">{t("print.printedOn")} {today}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">{t("print.customerInfo")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("print.name")}</span>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.company")}</span>
            <p className="font-medium">{customer.company || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.emailLabel")}</span>
            <p className="font-medium">{customer.email || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.phone")}</span>
            <p className="font-medium">{customer.phone || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.whatsapp")}</span>
            <p className="font-medium">{customer.whatsapp || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.city")}</span>
            <p className="font-medium">{customer.city || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.industry")}</span>
            <p className="font-medium">{customer.industry || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.website")}</span>
            <p className="font-medium">{customer.website || "-"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">{t("print.address")}</span>
            <p className="font-medium">{customer.address || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.status")}</span>
            <p className="font-medium uppercase">{customer.status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.pipeline")}</span>
            <p className="font-medium uppercase">{customer.pipeline_stage}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.source")}</span>
            <p className="font-medium">{customer.source || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("print.created")}</span>
            <p className="font-medium">{formatDate(customer.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Activities */}
      {customer.activities && customer.activities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">{t("print.activityHistory")}</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">{t("print.date")}</th>
                <th className="border p-2 text-left">{t("print.type")}</th>
                <th className="border p-2 text-left">{t("print.note")}</th>
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
          <h3 className="font-semibold mb-3">{t("common.followUp")}</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">{t("print.date")}</th>
                <th className="border p-2 text-left">{t("print.status")}</th>
                <th className="border p-2 text-left">{t("print.note")}</th>
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
        {t("print.autoGenerated")}
      </div>
    </div>
  );
}

export function printCustomer() {
  window.print();
}
