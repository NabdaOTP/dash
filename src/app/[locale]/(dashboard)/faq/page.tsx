import { setRequestLocale } from "next-intl/server";
import { FaqPage } from "@/features/faq/components/faq-page";

export default async function Faq({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FaqPage />;
}
