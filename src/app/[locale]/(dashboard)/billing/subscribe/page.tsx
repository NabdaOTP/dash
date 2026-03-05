import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { SubscribePage } from "@/features/billing/components/subscribe-page";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscribePage />
    </Suspense>
  );
}
