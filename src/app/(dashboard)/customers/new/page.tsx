"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";

export default function NewCustomerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isManager, loading } = usePermissions();

  useEffect(() => {
    if (!loading && isManager) {
      router.push("/customers");
    }
  }, [isManager, loading, router]);

  if (loading || isManager) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

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
