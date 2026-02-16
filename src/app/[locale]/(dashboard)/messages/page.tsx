import { setRequestLocale } from "next-intl/server";
import { MessagesPage } from "@/features/messages/components/messages-page";

export default async function Messages({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MessagesPage />;
}
