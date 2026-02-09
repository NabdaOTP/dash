import { setRequestLocale } from "next-intl/server";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardPage />;
}
