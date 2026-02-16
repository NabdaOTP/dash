import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

export default async function VerifyOtpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
