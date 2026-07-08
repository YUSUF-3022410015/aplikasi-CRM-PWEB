import { CustomerForm } from "@/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Customer</h1>
        <p className="text-muted-foreground">Tambahkan data pelanggan baru</p>
      </div>
      <CustomerForm mode="create" />
    </div>
  );
}
