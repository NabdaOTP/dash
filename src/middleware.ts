import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7757/ingest/77662e0a-535e-4a48-927d-ff4d626b6f07', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d50c7' },
    body: JSON.stringify({
      sessionId: '8d50c7',
      location: 'middleware.ts:8',
      message: 'Middleware fired',
      data: {
        url: req.url,
        pathname: req.nextUrl.pathname,
        nodeEnv: process.env.NODE_ENV,
        nextRuntime: process.env.NEXT_RUNTIME,
      },
      timestamp: Date.now(),
      runId: 'run2',
      hypothesisId: 'A-C',
    }),
  }).catch(() => {});
  // #endregion
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
