import { setRequestLocale } from "next-intl/server";
import { ContactPage } from "@/features/contact/components/contact-page";

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactPage />;
}
