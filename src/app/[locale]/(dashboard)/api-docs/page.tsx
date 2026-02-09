import { setRequestLocale } from "next-intl/server";
import { ApiDocsPage } from "@/features/api-docs/components/api-docs-page";

export default async function ApiDocs({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ApiDocsPage />;
}
