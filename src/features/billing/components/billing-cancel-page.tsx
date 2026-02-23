"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function BillingCancelPage() {
  const t = useTranslations("billing");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="bg-card rounded-2xl border border-border p-10 max-w-md w-full text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <Info className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t("checkout.cancelled")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("checkout.cancelledDesc")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/billing">{t("checkout.backToBilling")}</Link>
        </Button>
      </div>
    </div>
  );
}
