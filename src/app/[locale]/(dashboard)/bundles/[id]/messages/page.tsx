import BundleMessagesPage from "@/features/bundles/components/BundleMessagesPage";

export default async function Page({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { id, locale } = await params;

  return <BundleMessagesPage bundleId={id} locale={locale} />;
}
