import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // أضف اللغات التي يدعمها موقعك هنا
  locales: ['en', 'ar'],
  // اللغة الافتراضية
  defaultLocale: 'en'
});

export const config = {
  // هذا هو السطر السحري الذي سيحل المشكلة
  // يخبر الخادم بتجاهل ملفات التصميم (next_) وملفات الـ API
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
