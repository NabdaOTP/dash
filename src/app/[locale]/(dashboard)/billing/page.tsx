import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { BillingPage } from "@/features/billing/components/billing-page";

export default async function Billing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BillingPage />
    </Suspense>
  );
}
