# NadbaOTP - Full API Integration Plan

## Context

The NadbaOTP dashboard is a Next.js 16 frontend (React 19, TypeScript, Tailwind 4, next-intl) with a complete UI already built but using **mock data**. The backend API at `https://api.nabdaotp.com` is live with 37 endpoints across 9 modules. This plan integrates the real API into the frontend, replacing all mocks and adding missing pages/features.

**Auth model**: JWT Bearer tokens for dashboard, API Key for message sending. Registration requires OTP email verification. The API uses an "instance" concept — users own multiple instances and select one as active per session.

---

## Phase 1: Foundation — API Client & Auth Infrastructure [DONE]

### 1.1 Environment Setup
- [x] Create `.env.local` with `NEXT_PUBLIC_API_URL=https://api.nabdaotp.com`

### 1.2 API Client (`src/lib/api-client.ts`)
- [x] Create a fetch-based HTTP client wrapping `fetch()`
- [x] Base URL from env variable
- [x] Auto-attach `Authorization: Bearer <token>` from stored JWT
- [x] JSON request/response handling
- [x] Centralized error handling (401 → redirect to login, generic error toasts)
- [x] Request/response type generics

### 1.3 Auth Context (`src/features/auth/context/auth-context.tsx`)
- [x] React Context + Provider wrapping the app
- [x] State: `user`, `token`, `selectedInstance`, `isLoading`, `isAuthenticated`
- [x] Store JWT in `localStorage` (with hydration guard for SSR)
- [x] Actions: `login()`, `register()`, `logout()`, `selectInstance()`, `verifyOtp()`
- [x] On mount: check stored token → call `GET /api/v1/users/me` to validate & load user
- [x] Wrap dashboard layout with this provider

### 1.4 Route Protection (`src/middleware.ts`)
- [x] Extend existing i18n middleware to check auth state
- [x] Redirect unauthenticated users from `/dashboard/*` to `/login`
- [x] Redirect authenticated users from `/login`, `/signup` to `/dashboard`

### 1.5 Auth Types (`src/features/auth/types.ts`)
- [x] Define User, AuthState, LoginResponse, RegisterResponse types

**Files to create:**
- `src/lib/api-client.ts`
- `src/features/auth/context/auth-context.tsx`
- `src/features/auth/types.ts`
- `.env.local`

**Files to modify:**
- `src/middleware.ts`
- `src/features/layout/components/dashboard-layout.tsx`
- `src/app/[locale]/layout.tsx`

---

## Phase 2: Authentication Flows [DONE]

### 2.1 Login
- [x] Call `POST /api/v1/auth/login` with `{ email, password }`
- [x] Store JWT, fetch user profile, redirect to dashboard
- [x] Error handling (invalid credentials, unverified account)
- [x] Add "Forgot Password" link

### 2.2 Registration
- [x] Add missing fields: `name`, `phone`
- [x] Call `POST /api/v1/auth/register` with `{ name, email, phone, password }`
- [x] Redirect to OTP verification page

### 2.3 OTP Verification Page (NEW)
- [x] New page at `/verify-otp`
- [x] 6-digit code input
- [x] Call `POST /api/v1/auth/verify-otp` with `{ email, code }`

### 2.4 Forgot Password (NEW)
- [x] New page at `/forgot-password`
- [x] Call `POST /api/v1/auth/request-reset`

### 2.5 Reset Password (NEW)
- [x] New page at `/reset-password?token=xxx`
- [x] Call `POST /api/v1/auth/reset-password` with `{ token, newPassword }`

### 2.6 Instance Selection
- [x] After login, if multiple instances → show instance picker
- [x] Call `POST /api/v1/auth/select-instance`

### 2.7 Logout
- [x] Call `POST /api/v1/auth/logout`, clear state

**Files to create:**
- `src/features/auth/components/verify-otp-form.tsx`
- `src/features/auth/components/forgot-password-form.tsx`
- `src/features/auth/components/reset-password-form.tsx`
- `src/features/auth/components/instance-selector.tsx`
- `src/features/auth/services/auth-service.ts`
- `src/app/[locale]/verify-otp/page.tsx`
- `src/app/[locale]/forgot-password/page.tsx`
- `src/app/[locale]/reset-password/page.tsx`

**Files to modify:**
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/sign-up-form.tsx`
- `messages/en/auth.json` & `messages/ar/auth.json`

---

## Phase 3: Instance Management [DONE]

### 3.1 Instances Service
- [x] Replace mock data with real API calls
- [x] `getMyInstances()` → `GET /api/v1/instances/me`
- [x] `getCurrentInstance()` → `GET /api/v1/instances/me/current`
- [x] `getInstance(id)` → `GET /api/v1/instances/{id}`
- [x] `createInstance()` → `POST /api/v1/instances`
- [x] `updateInstance(id, name)` → `PUT /api/v1/instances/{id}`
- [x] `deleteInstance(id)` → `DELETE /api/v1/instances/{id}`

### 3.2 Update Types
- [x] Align `Instance` interface with actual API response

### 3.3 Instances Page
- [x] Fetch real data, add create/edit/delete with real API
- [x] API key rotation: `POST /api/v1/api-keys/rotate`

**Files to modify:**
- `src/features/instances/services/instances-service.ts`
- `src/features/instances/types.ts`
- `src/features/instances/components/instances-page.tsx`
- `src/features/instances/components/instance-detail-modal.tsx`

---

## Phase 4: WhatsApp Integration [DONE]

### 4.1 WhatsApp Service (NEW)
- [x] `connect()` → `POST /api/v1/whatsapp/connect`
- [x] `getQrCode()` → `GET /api/v1/whatsapp/qr`
- [x] `getStatus()` → `GET /api/v1/whatsapp/status`
- [x] `disconnect()` → `POST /api/v1/whatsapp/disconnect`
- [x] `restart()` → `POST /api/v1/whatsapp/restart`

### 4.2 WhatsApp Connection Flow
- [x] Connect → show QR → poll status → show connected state
- [x] Disconnect/Restart buttons

**Files to create:**
- `src/features/whatsapp/services/whatsapp-service.ts`
- `src/features/whatsapp/types.ts`

---

## Phase 5: Dashboard with Real Data [DONE]

- [x] Replace mock stats with real instance/WhatsApp/message data
- [x] Loading skeleton states

**Files to modify:**
- `src/features/dashboard/services/dashboard-service.ts`
- `src/features/dashboard/components/dashboard-page.tsx`

---

## Phase 6: Messages [DONE]

- [x] New page at `/messages`
- [x] `GET /api/v1/messages` with pagination and status filter
- [x] Table view with status badges
- [x] Add to sidebar navigation

**Files to create:**
- `src/features/messages/components/messages-page.tsx`
- `src/features/messages/services/messages-service.ts`
- `src/features/messages/types.ts`
- `src/app/[locale]/(dashboard)/messages/page.tsx`
- `messages/en/messages.json` & `messages/ar/messages.json`

---

## Phase 7: User Profile & Settings [DONE]

- [x] Profile page: view/edit name, email, phone
- [x] Change password
- [x] 2FA management (enable, confirm, disable)

**Files to create:**
- `src/features/settings/components/settings-page.tsx`
- `src/features/settings/components/profile-section.tsx`
- `src/features/settings/components/password-section.tsx`
- `src/features/settings/components/two-factor-section.tsx`
- `src/features/settings/services/settings-service.ts`
- `src/app/[locale]/(dashboard)/settings/page.tsx`
- `messages/en/settings.json` & `messages/ar/settings.json`

---

## Phase 8: Billing & Subscriptions [DONE]

- [x] Plans display, subscribe, trial management
- [x] Auto-renewal toggle
- [x] Invoices list
- [x] API key rotation

**Files to create:**
- `src/features/billing/components/billing-page.tsx`
- `src/features/billing/services/billing-service.ts`
- `src/features/billing/types.ts`
- `src/app/[locale]/(dashboard)/billing/page.tsx`
- `messages/en/billing.json` & `messages/ar/billing.json`

---

## Implementation Order

| Priority | Phase | Status |
|----------|-------|--------|
| 1 | Phase 1: Foundation | DONE |
| 2 | Phase 2: Auth Flows | DONE |
| 3 | Phase 3: Instances | DONE |
| 4 | Phase 4: WhatsApp | DONE |
| 5 | Phase 5: Dashboard | DONE |
| 6 | Phase 6: Messages | DONE |
| 7 | Phase 7: Settings | DONE |
| 8 | Phase 8: Billing | DONE |

---

## API Reference (from Swagger)

**Base URL:** `https://api.nabdaotp.com`
**Auth:** Bearer JWT (dashboard) | API Key header (messages)

### Schemas
- **RegisterDto:** `{ name, email, phone, password }` (password min 8)
- **LoginDto:** `{ email, password }`
- **SelectInstanceDto:** `{ instanceId }` (UUID)
- **VerifyOtpDto:** `{ email, code }` (6-digit)
- **RequestResetDto:** `{ email }`
- **ResetPasswordDto:** `{ token, newPassword }`
- **Confirm2faDto:** `{ code }`
- **Disable2faDto:** `{ code }`
- **UpdateProfileDto:** `{ name?, phone?, email? }`
- **ChangePasswordDto:** `{ currentPassword, newPassword }` (min 8)
- **UpdateMyInstanceDto:** `{ name }` (max 150)
- **SendMessageDto:** `{ phone, message }`
- **SubscribeDto:** `{ planId }` (UUID)
- **SetAutoRenewDto:** `{ autoRenew }` (boolean)
