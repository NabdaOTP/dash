import { setRequestLocale } from "next-intl/server";
import { SettingsPage } from "@/features/settings/components/settings-page";

export default async function Settings({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SettingsPage />;
}
