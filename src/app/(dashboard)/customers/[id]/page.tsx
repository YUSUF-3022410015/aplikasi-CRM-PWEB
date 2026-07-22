"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Pencil, Phone, Mail, MapPin, Building, Globe, MessageSquare, Printer } from "lucide-react";
import Link from "next/link";
import { ActivityTimeline } from "@/components/activity-timeline";
import { AddActivityForm } from "@/components/add-activity-form";
import { FollowUpList } from "@/components/followup-list";
import { CustomerPrint, printCustomer } from "@/components/customer-print";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useLanguage } from "@/components/language-provider";
import { usePermissions } from "@/hooks/use-permissions";
import type { Activity as ActivityType, FollowUp as FollowUpType } from "@/types/database";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  lead: "secondary",
  prospect: "warning",
  active: "success",
  inactive: "secondary",
  archived: "default",
};

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  industry: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  source: string | null;
  status: string;
  pipeline_stage: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const [supabase] = useState(() => createClient());

  const { isManager } = usePermissions();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [followups, setFollowups] = useState<FollowUpType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: cust } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();

        if (!cust) {
          setCustomer(null);
          setLoading(false);
          return;
        }

        setCustomer(cust);

        const { data: acts } = await supabase
          .from("activities")
          .select("*, user:profiles(fullname)")
          .eq("customer_id", id)
          .order("created_at", { ascending: false });

        setActivities(acts || []);

        const { data: fups } = await supabase
          .from("followups")
          .select("*")
          .eq("customer_id", id)
          .order("due_date", { ascending: false });

        setFollowups(fups || []);
      } catch (error) {
        console.error("Failed to fetch customer detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("customers.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.company || t("customers.noCompany")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WhatsAppButton
            phone={customer.phone || customer.whatsapp || ""}
            customerName={customer.name}
          />
          <Button variant="outline" onClick={printCustomer}>
            <Printer className="mr-2 h-4 w-4" />
            {t("customers.printPdf")}
          </Button>
          {!isManager && (
            <Link href={`/customers/${customer.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("customers.info")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.company")}</p>
                    <p className="font-medium">{customer.company || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.email")}</p>
                    <p className="font-medium">{customer.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.phone")}</p>
                    <p className="font-medium">{customer.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.whatsapp")}</p>
                    <p className="font-medium">{customer.whatsapp || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.city")}</p>
                    <p className="font-medium">{customer.city || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.website")}</p>
                    <p className="font-medium">{customer.website || "-"}</p>
                  </div>
                </div>
              </div>
              {customer.address && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("customers.address")}</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("customers.status")}</p>
                  <Badge variant={statusColors[customer.status] || "default"} className="mt-1">
                    {customer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("customers.pipeline")}</p>
                  <Badge variant="outline" className="mt-1">
                    {customer.pipeline_stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("customers.source")}</p>
                  <p className="font-medium">{customer.source || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("customers.detail")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("customers.industry")}</p>
                <p className="font-medium">{customer.industry || "-"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">{t("customers.createdAt")}</p>
                <p className="font-medium">{formatDate(customer.created_at)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">{t("customers.updatedAt")}</p>
                <p className="font-medium">{formatDate(customer.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">{t("customers.activities")}</TabsTrigger>
          <TabsTrigger value="followups">{t("customers.followupsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="space-y-4">
          {!isManager && <AddActivityForm customerId={customer.id} />}
          <ActivityTimeline activities={activities} />
        </TabsContent>
        <TabsContent value="followups" className="space-y-4">
          <FollowUpList followups={followups} customerId={customer.id} />
        </TabsContent>
      </Tabs>

      {/* Printable version - only shows when printing */}
      <CustomerPrint
        customer={{
          ...customer,
          activities,
          followups,
        }}
      />
    </div>
  );
}
