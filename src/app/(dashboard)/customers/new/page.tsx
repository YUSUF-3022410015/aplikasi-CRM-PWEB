"use client";

import { CustomerForm } from "@/components/customer-form";
import { useLanguage } from "@/components/language-provider";

export default function NewCustomerPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("customers.addCustomer")}</h1>
        <p className="text-muted-foreground">{t("customers.addCustomerDesc")}</p>
      </div>
      <CustomerForm mode="create" />
    </div>
  );
}
