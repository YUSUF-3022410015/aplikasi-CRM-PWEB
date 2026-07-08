import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        <p className="text-muted-foreground">Perbarui data pelanggan</p>
      </div>
      <CustomerForm customer={customer} mode="edit" />
    </div>
  );
}
