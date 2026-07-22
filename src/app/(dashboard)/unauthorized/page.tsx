"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className="w-full max-w-md text-center border-border/50 shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("unauthorized.title")}</CardTitle>
          <CardDescription className="text-sm mt-2 leading-relaxed">
            {t("unauthorized.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button className="shadow-sm px-8">
              {t("unauthorized.backToDashboard")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
