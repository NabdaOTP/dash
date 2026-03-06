// app/[locale]/(dashboard)/instances/[id]/messages/page.tsx

import InstanceMessagesPage from "@/features/messages/components/InstanceMessagesPage";

export default async function Page({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { id, locale } = params;

  return <InstanceMessagesPage instanceId={id} locale={locale} />;
}
