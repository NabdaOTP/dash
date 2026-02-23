import { setRequestLocale } from "next-intl/server";
import { BillingSuccessPage } from "@/features/billing/components/billing-success-page";

export default async function BillingSuccess({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BillingSuccessPage />;
}
