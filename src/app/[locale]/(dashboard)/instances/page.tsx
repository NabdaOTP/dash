import { setRequestLocale } from "next-intl/server";
import { InstancesPage } from "@/features/instances/components/instances-page";

export default async function Instances({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstancesPage />;
}
