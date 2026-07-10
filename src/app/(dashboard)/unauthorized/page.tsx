"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-2xl">{t("unauthorized.title")}</CardTitle>
          <CardDescription>
            {t("unauthorized.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button>{t("unauthorized.backToDashboard")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
