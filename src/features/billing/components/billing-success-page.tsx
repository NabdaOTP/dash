"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function BillingSuccessPage() {
  const t = useTranslations("billing");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="bg-card rounded-2xl border border-border p-10 max-w-md w-full text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t("checkout.success")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("checkout.successDesc")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link href="/billing">{t("checkout.goToBilling")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("checkout.goToDashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
