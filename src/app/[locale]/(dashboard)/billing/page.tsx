import { setRequestLocale } from "next-intl/server";
import { BillingPage } from "@/features/billing/components/billing-page";

export default async function Billing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BillingPage />;
}
