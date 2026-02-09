import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const auth = (await import(`../../messages/${locale}/auth.json`)).default;
  const dashboard = (await import(`../../messages/${locale}/dashboard.json`)).default;
  const instances = (await import(`../../messages/${locale}/instances.json`)).default;
  const apiDocs = (await import(`../../messages/${locale}/apiDocs.json`)).default;
  const faq = (await import(`../../messages/${locale}/faq.json`)).default;
  const contact = (await import(`../../messages/${locale}/contact.json`)).default;

  return {
    locale,
    messages: { common, auth, dashboard, instances, apiDocs, faq, contact },
  };
});
