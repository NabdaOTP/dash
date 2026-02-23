import { setRequestLocale } from "next-intl/server";
import { BillingCancelPage } from "@/features/billing/components/billing-cancel-page";

export default async function BillingCancel({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BillingCancelPage />;
}
