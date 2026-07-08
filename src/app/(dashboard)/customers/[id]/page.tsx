import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Pencil, Phone, Mail, MapPin, Building, Globe, MessageSquare, Printer, Download } from "lucide-react";
import Link from "next/link";
import { ActivityTimeline } from "@/components/activity-timeline";
import { AddActivityForm } from "@/components/add-activity-form";
import { FollowUpList } from "@/components/followup-list";
import { CustomerPrint, printCustomer } from "@/components/customer-print";
import { WhatsAppButton } from "@/components/whatsapp-button";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  lead: "secondary",
  prospect: "warning",
  active: "success",
  inactive: "secondary",
  archived: "default",
};

export default async function CustomerDetailPage({
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

  const { data: activities } = await supabase
    .from("activities")
    .select("*, user:profiles(fullname)")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const { data: followups } = await supabase
    .from("followups")
    .select("*")
    .eq("customer_id", id)
    .order("due_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.company || "Tanpa perusahaan"}</p>
        </div>
        <div className="flex gap-2">
          <WhatsAppButton
            phone={customer.phone || customer.whatsapp || ""}
            customerName={customer.name}
          />
          <Button variant="outline" onClick={printCustomer}>
            <Printer className="mr-2 h-4 w-4" />
            Print PDF
          </Button>
          <Link href={`/customers/${customer.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Perusahaan</p>
                    <p className="font-medium">{customer.company || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>
                    <p className="font-medium">{customer.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{customer.whatsapp || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kota</p>
                    <p className="font-medium">{customer.city || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-medium">{customer.website || "-"}</p>
                  </div>
                </div>
              </div>
              {customer.address && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Alamat</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusColors[customer.status] || "default"} className="mt-1">
                    {customer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <Badge variant="outline" className="mt-1">
                    {customer.pipeline_stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sumber Lead</p>
                  <p className="font-medium">{customer.source || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Industri</p>
                <p className="font-medium">{customer.industry || "-"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Dibuat</p>
                <p className="font-medium">{formatDate(customer.created_at)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Diupdate</p>
                <p className="font-medium">{formatDate(customer.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Aktivitas</TabsTrigger>
          <TabsTrigger value="followups">Follow-up</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="space-y-4">
          <AddActivityForm customerId={customer.id} />
          <ActivityTimeline activities={activities || []} />
        </TabsContent>
        <TabsContent value="followups" className="space-y-4">
          <FollowUpList followups={followups || []} customerId={customer.id} />
        </TabsContent>
      </Tabs>

      {/* Printable version - only shows when printing */}
      <CustomerPrint
        customer={{
          ...customer,
          activities: activities || [],
          followups: followups || [],
        }}
      />
    </div>
  );
}
