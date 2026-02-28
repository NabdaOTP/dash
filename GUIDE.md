# NadbaOTP Dashboard — Developer Guide


---

## 1. Project overview

- **What it is:** Next.js dashboard for **NadbaOTP** — a WhatsApp OTP service. Users manage instances, connect WhatsApp, view messages, manage billing, and configure profile/2FA.
- **Backend:** Live API at `https://api.nabdaotp.com` (37 endpoints). Frontend uses JWT (Bearer) for dashboard; API Key is for external message sending only.
- **Auth model:** Register → OTP verification → Login. Users have **instances**; one is selected per session. Token in `localStorage` key `nadba-token`, instance in `nadba-instance`.

---

## 2. Handover notes and known issues

- **Many endpoints do not work in testing.** When testing (UI or curl), you may see failures or unexpected behaviour. The frontend is wired to the API contract; issues are likely backend/API or environment (e.g. wrong base URL, CORS, or backend not fully implemented). Prioritise verifying which endpoints work and coordinating with backend/API owner.
- **Route protection:** Auth redirect logic lives in **`src/proxy.ts`**. Next.js normally only runs a file named **`middleware.ts`**. If you find unauthenticated users can hit dashboard routes, rename `proxy.ts` to `middleware.ts` (or add a root `middleware.ts` that imports and invokes the logic from `proxy.ts`).
- **Settings** are not in the sidebar; they are in the **user dropdown** (top right) → “Settings”.
- Keep this guide updated as you fix issues or change architecture so the next person has one place to look.

---

## 3. Quick start

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

- Root `/` redirects to `/login`. Default locale is **Arabic (RTL)**. English uses `/en/` prefix (e.g. `/en/dashboard`).
- **Environment:** Create `.env.local` if needed. API base URL: `NEXT_PUBLIC_API_URL` (defaults to `https://api.nabdaotp.com`). Next.js rewrites `/api/*` to the backend in `next.config.ts`; the API client may call the backend URL directly depending on config.

---

## 4. Tech stack

| Layer      | Technology           | Version |
|-----------|----------------------|--------|
| Framework | Next.js (App Router) | 16.x   |
| UI        | React                | 19.x   |
| Language  | TypeScript (strict)  | 5.x    |
| Styling   | Tailwind CSS         | v4     |
| Components| shadcn/ui (manual)   | —      |
| Icons     | lucide-react         | 0.563.x|
| i18n      | next-intl            | 4.8.x  |
| Radix     | accordion, dialog, dropdown-menu, separator, tabs, slot | 1.x–2.x |

---

## 5. Project structure

```
src/
├── app/
│   ├── globals.css
│   └── [locale]/
│       ├── layout.tsx              # Root: fonts, i18n, theme, AuthProvider
│       ├── page.tsx                # Redirects to /login
│       ├── not-found.tsx
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       ├── verify-otp/page.tsx
│       ├── forgot-password/page.tsx
│       ├── reset-password/page.tsx
│       └── (dashboard)/            # Sidebar layout, protected
│           ├── layout.tsx
│           ├── dashboard/page.tsx
│           ├── instances/page.tsx
│           ├── messages/page.tsx
│           ├── billing/page.tsx
│           ├── billing/success/page.tsx
│           ├── billing/cancel/page.tsx
│           ├── settings/page.tsx
│           ├── api-docs/page.tsx
│           ├── faq/page.tsx
│           └── contact/page.tsx
├── components/
│   ├── ui/                         # shadcn primitives — do not modify internals
│   └── qr-code-display.tsx
├── features/
│   ├── auth/                       # Login, register, OTP, forgot/reset password, instance selection
│   │   ├── context/auth-context.tsx
│   │   ├── services/auth-service.ts
│   │   ├── components/ (login-form, sign-up-form, verify-otp-form, forgot-password-form, reset-password-form, country-code-selector)
│   │   ├── hooks/
│   │   └── types.ts
│   ├── dashboard/                  # Stats, WhatsApp connect/QR/status
│   │   ├── components/ (dashboard-page, stats-card)
│   │   └── services/dashboard-service.ts
│   ├── instances/                  # CRUD, API key rotation
│   │   ├── components/ (instances-page, instance-detail-modal, code-snippet)
│   │   ├── services/instances-service.ts
│   │   └── types.ts
│   ├── messages/                   # List, pagination, filters
│   │   ├── components/messages-page.tsx
│   │   ├── services/messages-service.ts
│   │   └── types.ts
│   ├── billing/                    # Plans, subscribe, trial, invoices, success/cancel pages
│   │   ├── components/ (billing-page, billing-success-page, billing-cancel-page)
│   │   ├── services/billing-service.ts
│   │   └── types.ts
│   ├── settings/                   # Profile, password, 2FA (one page component)
│   │   ├── components/settings-page.tsx
│   │   └── services/settings-service.ts
│   ├── whatsapp/                   # Used by dashboard; no dedicated page
│   │   ├── services/whatsapp-service.ts
│   │   └── types.ts
│   ├── api-docs/   faq/   contact/ # Static/docs pages
│   └── layout/                     # dashboard-layout, theme-provider, theme-toggle, language-switcher, constants (nav)
├── i18n/                           # routing.ts, request.ts, navigation.ts
├── lib/
│   ├── api-client.ts               # fetch wrapper, Bearer token, 401 → clear + redirect, ApiError
│   └── utils.ts                    # cn()
└── proxy.ts                        # i18n + auth route protection (see Handover: consider renaming to middleware.ts)

messages/
├── ar/  en/                        # common, auth, dashboard, instances, messages, billing, settings, apiDocs, faq, contact
```

---

## 6. Architecture

### Feature modules

Each feature under `src/features/<name>/`:

- **components/** — React UI (`"use client"` where needed).
- **services/** — API calls (async functions using `src/lib/api-client.ts`).
- **types.ts** — TypeScript interfaces.

Route pages in `app/[locale]/.../page.tsx` are thin: call `setRequestLocale(locale)` and render the feature component. Business logic stays in features.

### API client (`src/lib/api-client.ts`)

- Uses `fetch`; base URL from `NEXT_PUBLIC_API_URL` or `https://api.nabdaotp.com`.
- Adds `Authorization: Bearer <token>` from `localStorage`.
- On 401: clears token/instance and throws; dashboard layout can redirect to login.
- Backend response envelope `{ success, data }` is unwrapped; services receive `data`.
- Methods: `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.patch<T>()`, `api.delete<T>()`.
- Errors: `ApiError` with `status`, `data`, `message`.

### Adding a new feature

1. Create `src/features/<name>/` with `components/`, `services/`, `types.ts`.
2. Add `messages/en/<name>.json` and `messages/ar/<name>.json`.
3. Register the namespace in `src/i18n/request.ts` (import and add to `messages`).
4. Add the route under `src/app/[locale]/...` (under `(dashboard)/` if it needs the sidebar).
5. If it’s a nav item, add it to `src/features/layout/constants.ts` (navItems).

### Adding a shadcn/ui component

Install manually (no CLI): copy from [shadcn/ui](https://ui.shadcn.com), use `cn` from `@/lib/utils`, Radix from `@radix-ui/*`, `"use client"` where needed, and install any `@radix-ui/react-<name>` package.

---

## 7. Theming and i18n

### Theme

- CSS variables in `globals.css` (`:root` and `.dark`). Tailwind v4 uses `@theme inline`. `ThemeProvider` toggles `.dark` on `<html>`. Stored in `localStorage` key `nadba-theme`. Utility classes: `.gradient-primary`, `.shadow-card`, `.shadow-elevated`, `.animate-fade-in`, `.animate-qr-scan`.

### i18n

- **next-intl**, locales `ar` (default, RTL) and `en` (LTR). Prefix “as-needed”: Arabic no prefix, English `/en/`.
- **Namespaces:** common, auth, dashboard, instances, messages, billing, settings, apiDocs, faq, contact.
- **Client:** `useTranslations("namespace")` → `t("key")`. **Server:** `getTranslations("namespace")`.
- **RTL:** Prefer `text-start`/`text-end`, `ps-*`/`pe-*`, `ms-*`/`me-*`.

---

## 8. Routing and navigation

- **Auth routes (no token required):** `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`.
- **Protected (require token):** everything under `(dashboard)`: `/dashboard`, `/instances`, `/messages`, `/billing`, `/billing/success`, `/billing/cancel`, `/settings`, `/api-docs`, `/faq`, `/contact`.
- Always use i18n-aware navigation: `import { Link, useRouter, usePathname } from "@/i18n/navigation"`. Server redirect: `redirect({ href: "/login", locale })` from `@/i18n/navigation`.

---

## 9. Backend API reference

**Base URL:** `https://api.nabdaotp.com`
**Proxy:** Next.js can rewrite `/api/*` to the backend (see `next.config.ts`). The client may call the backend URL directly.

**Auth:** Dashboard uses **Bearer JWT** (`Authorization: Bearer <token>`). Message sending for external integrations uses **API Key** (not used by the dashboard).

**Response format:** Success: `{ "success": true, "data": {...} }`. Errors: `{ "success": false, "message": "...", "statusCode": ... }`. The API client unwraps `data`.

### Service → endpoints mapping

| Service file | Covers |
|-------------|--------|
| `src/lib/api-client.ts` | HTTP client only |
| `src/features/auth/services/auth-service.ts` | Login, register, verify-otp, select-instance, logout, request-reset, reset-password, getMe |
| `src/features/settings/services/settings-service.ts` | PATCH users/me, PATCH users/me/password, enable/confirm/request-disable/disable 2FA |
| `src/features/instances/services/instances-service.ts` | Instances CRUD, GET me/me/current, POST api-keys/rotate |
| `src/features/whatsapp/services/whatsapp-service.ts` | connect, qr, status, disconnect, restart |
| `src/features/messages/services/messages-service.ts` | GET messages (pagination, status filter) |
| `src/features/dashboard/services/dashboard-service.ts` | Aggregated stats (instances, WhatsApp, messages) |
| `src/features/billing/services/billing-service.ts` | GET plans, subscribe, startTrial, extendTrial, setAutoRenew, getInvoices |

**Not used by the frontend:** `POST /api/v1/messages/send` (API key, for external callers), `POST /api/v1/billing/stripe/webhook` (server-to-server), `GET /v1/health` (internal).

### Main endpoints (for debugging and tests)

- **Auth:** POST `/api/v1/auth/login`, `/register`, `/verify-otp`, `/select-instance`, `/logout`, `/request-reset`, `/reset-password`.
- **User:** GET/PATCH `/api/v1/users/me`, PATCH `/api/v1/users/me/password`.
- **2FA:** POST `/api/v1/auth/enable-2fa`, `/confirm-2fa`, `/request-disable-2fa`, `/disable-2fa`.
- **Instances:** GET `/api/v1/instances/me`, `/me/current`, GET/POST/PUT/DELETE `/api/v1/instances`, GET/PUT/DELETE `/api/v1/instances/:id`.
- **API key:** POST `/api/v1/api-keys/rotate`.
- **WhatsApp:** POST `/api/v1/whatsapp/connect`, GET `/qr`, GET `/status`, POST `/disconnect`, `/restart`.
- **Messages:** GET `/api/v1/messages?status=&page=&limit=`.
- **Billing:** GET `/api/v1/plans`, GET `/api/v1/billing/invoices`; POST `/api/v1/subscriptions/subscribe`, `/trial/start`, `/trial/extend`; PATCH `/api/v1/subscriptions/auto-renew`.

Request/response shapes are in the backend Swagger/OpenAPI if available (e.g. `https://api.nabdaotp.com/api-docs`).

---

## 10. Testing and known issues

- **Many endpoints do not work in testing.** When you run through the app or use curl, expect some calls to fail or behave unexpectedly. The frontend is built against the documented API; failures are likely due to backend, environment, or API changes. Document which endpoints work and which don’t as you go.
- **Getting a token:** Login via UI at `/login` or POST `/api/v1/auth/login` with `{ "email", "password" }`. Use the returned token in `Authorization: Bearer <token>` for other requests.
- **UI smoke flow (when backend allows):** Register → verify OTP → login → create/select instance → dashboard → connect WhatsApp (QR) → messages → billing (plans, subscribe/trial) → settings (profile, password, 2FA) → logout.
- **Stripe:** Success/cancel redirects go to `/billing/success` and `/billing/cancel`. Test card (Stripe): `4242 4242 4242 4242`.
- **Settings** are under the user menu (top right), not in the sidebar.

---

## 11. Key files

| Purpose | File |
|--------|------|
| API client | `src/lib/api-client.ts` |
| Auth state & actions | `src/features/auth/context/auth-context.tsx` |
| Route protection + i18n | `src/proxy.ts` (consider `middleware.ts`) |
| Root layout | `src/app/[locale]/layout.tsx` |
| Dashboard layout + sidebar | `src/features/layout/components/dashboard-layout.tsx` |
| Sidebar nav config | `src/features/layout/constants.ts` |
| Theme | `src/app/globals.css` |
| i18n config | `src/i18n/routing.ts` |
| Message loading | `src/i18n/request.ts` |
| Locale-aware Link/router | `src/i18n/navigation.ts` |
| Tailwind merge | `src/lib/utils.ts` |

---

## 12. Important details

- **Tailwind v4:** Use `@import "tailwindcss"` (not `@tailwind base/...`).
- **redirect** from `@/i18n/navigation` takes an object: `{ href, locale }`.
- Pages that need static rendering call `setRequestLocale(locale)`.
- **`public/design/`** is reference-only (may be excluded from build).
- Backend may return `accessToken` or `access_token`; auth code handles both.

---

بالتوفيق
