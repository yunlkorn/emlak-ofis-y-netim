# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check (no test suite exists)

npm run db:push      # Push Drizzle schema to Supabase (dev)
npm run db:generate  # Generate migration files
npm run db:studio    # Drizzle Studio GUI
npm run seed         # Run scripts/seed.ts
```

## Architecture

**Stack**: Next.js 15 App Router · Supabase (auth + Postgres) · Drizzle ORM (types + schema only) · Tailwind v4 · Zod

**Key rule**: Supabase is accessed via HTTP (`@supabase/ssr`), not direct Postgres. Drizzle is used only for type definitions (`lib/schema.ts`) and migrations — never instantiated at runtime in API routes. All DB queries go through helper functions in `lib/db.ts` which use `getDb()` (returns the Supabase client).

### Auth flow

- `middleware.ts` — redirects unauthenticated users away from `/admin`, redirects logged-in users away from `/giris`/`/kayit`
- `lib/auth.ts` — `requireUser()` / `requireBrokerRole(roles[])` — used in server components and API routes
- `lib/supabase/server.ts` — SSR client (cookies), `lib/supabase/admin.ts` — service role client for user management
- `lib/getRole.ts` — `getSessionRole()` shortcut for server components

### Multi-tenant structure

- `tenants` table: office/company accounts with a `plan` enum (`baslangic`/`takim`/`kurumsal`), linked to an `owner_user_id`
- `brokers` table: individual users with `role` enum (`admin`/`broker`/`stajyer`), linked to `tenant_id`
- `PLAN_LIMITS` in `lib/schema.ts` maps plan → `{ maxBrokers, maxLeadsPerMonth, label }`
- Broker creation is admin-only via `POST /api/brokers`; uses `supabaseAdmin.auth.admin.createUser()` then inserts into `brokers`. If DB insert fails, auth user is deleted (rollback).

### Route groups

- `app/(auth)/` — `/giris` (login), `/kayit` (multi-step SaaS business onboarding)
- `app/admin/` — protected CRM panel. Layout in `app/admin/layout.tsx` calls `requireBrokerRole`
- `app/admin/danismanlar/` — broker management (admin-only)
- `app/api/` — all API routes use Zod for validation + `requireBrokerRole` for auth

### Styling conventions

- **Never use Tailwind color utilities** for brand/theme colors. Use CSS variables via `style={{ color: "var(--c-brand)" }}`.
- CSS vars defined in `app/globals.css`: `--c-brand: oklch(56% 0.20 38)` (terracotta), `--font-display: 'Syne'`, `--font-body: 'Plus Jakarta Sans'`
- Utility classes: `admin-card`, `admin-btn`, `admin-btn-primary`, `admin-btn-ghost`, `admin-input`, `stage-badge`, `data-table`, `fade-up`
- Role-based sidebar visibility uses `roleLevel` map in `SidebarNav.tsx`

### Public-facing pages

- `app/page.tsx` — SaaS landing page (LeadHane branding, pricing tiers)
- `app/ilanlar/` — public property listings
- `app/ilan/[id]/` — single listing detail
- `app/brokerlarimiz/` — team page

### Environment variables needed

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_OFFICE_NAME
ANTHROPIC_API_KEY       # AI property matcher / lead summaries
```

---

## How this user works — collaboration style

These observations are drawn from the full conversation history. Follow them without being asked.

### Communication

- Writes in Turkish. Respond in Turkish unless code, file paths, or technical terms require English.
- Gives high-level directives, not step-by-step instructions ("her pakete özel danışman sınırı olsun"). Infer the full implementation from the intent — don't ask clarifying questions for details that can be reasoned out.
- Uses "kaldığın yerden devam et" to resume after a context switch or model change. When this appears, pick up the most recently completed logical unit and continue to the next natural task.
- Does not want a running commentary. Short status updates at key moments, concise end-of-task summary.

### Decision-making

- Does not want to be asked about implementation choices that have a clear best answer given the existing codebase (e.g. which helper function to use, how to structure a new route). Make the decision, execute, report the result.
- Pivots product direction decisively and expects the full downstream impact to be handled in one pass (e.g. "SaaS'a dönüşüyor" → landing page + onboarding + broker creation all changed together without separate confirmations for each).
- Enforces constraints server-side, not just client-side. When a business rule is introduced (plan limits, role gates), it must be enforced at the API layer even if the UI also reflects it.

### Code quality

- Runs `npx tsc --noEmit` to verify after significant changes. TypeScript must be clean — no `any` escapes, no missing properties in mappers.
- Rollback on partial failure is expected (auth user deleted if DB insert fails).
- No orphaned routes or dead nav links — when a page is renamed or moved, all references (sidebar, modals, redirects) are updated in the same pass.

### Design

- Design consistency across the product is a hard requirement. New pages (landing, onboarding) must use the same CSS variables, utility classes, and component patterns as the admin panel — not a separate visual language.
- All UI copy is Turkish. Labels, error messages, placeholders, empty states — everything.
- When a limit or error condition exists (e.g. plan broker limit reached), the UI must surface an actionable path (upgrade link), not just an error string.

### Scope

- Builds in vertical slices: schema → API → UI in one pass per feature. Does not want schema changes delivered separately from the UI that uses them.
- Expects database migrations to be provided as raw SQL when the MCP/Supabase connection is unavailable, so the user can run them manually.
- Placeholder implementations (e.g. Sahibinden scraper) are acceptable when the integration requires external work; mark them clearly in code comments, not just in conversation.
