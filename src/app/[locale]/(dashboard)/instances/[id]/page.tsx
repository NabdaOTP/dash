import { setRequestLocale } from "next-intl/server";
import { InstanceDetailView } from "@/features/instances/components/instance-detail-view";

export default async function InstanceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <InstanceDetailView id={id} locale={locale} />;
}