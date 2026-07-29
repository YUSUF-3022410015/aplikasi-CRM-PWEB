"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CustomerForm } from "@/components/customer-form";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";
import type { Customer } from "@/types/database";

export default function EditCustomerPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());
  const { isManager, loading: permLoading } = usePermissions();

  useEffect(() => {
    if (!permLoading && isManager) {
      router.push(`/customers/${id}`);
    }
  }, [isManager, permLoading, router, id]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();
        setCustomer(data);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading || permLoading || isManager) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("common.loading")}</p></div>;
  }

  if (!customer) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("customers.notFound")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("customers.editCustomer")}</h1>
        <p className="text-muted-foreground">{t("customers.editCustomerDesc")}</p>
      </div>
      <CustomerForm customer={customer} mode="edit" />
    </div>
  );
}
