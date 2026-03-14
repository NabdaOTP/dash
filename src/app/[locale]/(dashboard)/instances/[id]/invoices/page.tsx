import InstanceInvoicesPage from "@/features/billing/components/instanceInvoicesPage";
 
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  return <InstanceInvoicesPage instanceId={id} locale={locale} />;
}