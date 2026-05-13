# 01 — Mikro SaaS Başlangıç Projesi

> Next.js 16 + Clerk auth + Drizzle/Neon + Stripe ödeme tabanlı mikro-SaaS iskelesi. Tek komutla kendi SaaS'ınızın ilk sürümünü çalışır halde kurar.

## Proje Özeti

Bu bir **mikro-SaaS template** projesidir. Kullanıcı bu spec'i Claude Code'a verince: ücretsiz/starter/pro fiyat katmanlı, sign-up/sign-in'i çalışan, Stripe Checkout'la ödeme alan, webhook'la subscription takip eden, korumalı dashboard'u olan bir Next.js projesi kurulur. Sektör spesifik değildir — her tür mikro-SaaS için (analytics, tool, içerik üretme, vs) aynı temel kullanılır.

Son kullanıcı: DOA üyesi **Claude Code ile kendi SaaS fikrinin** ilk versiyonunu kurmak istiyor. Projenin bir hafta içinde canlı olup ilk müşteriye sunulması hedefleniyor.

## Hedef Müşteri

Bu projenin kullanıcısı (SaaS'ı kuran) DOA üyesidir. SaaS'ın son kullanıcıları ise kurucunun belirlediği niş — bu spec generic tabanı verir, içeriği kurucunun kendisi ekler.

## Fiyat Modeli (kurucunun son kullanıcılara uygulayacağı)

- Free — 1 proje, 100 event/ay
- Starter $19/ay — 5 proje, 10K event/ay
- Pro $49/ay — 50 proje, 100K event/ay

Bu değerleri projeye kodluyoruz — kurucu sonra Stripe dashboard'da fiyatları değiştirir, `PRICE_TO_PLAN` mapping güncellenir.

## Teknoloji Yığını

```json
{
  "runtime": "Node.js 22+, pnpm 9+",
  "framework": "Next.js 16 (App Router)",
  "language": "TypeScript 5.6+ strict",
  "styling": "Tailwind CSS 4",
  "auth": "@clerk/nextjs 6",
  "database": "Neon Postgres + drizzle-orm 0.36 + @neondatabase/serverless",
  "payment": "Stripe 17",
  "ui": "shadcn komponenti gerektiğinde, lucide-react icon",
  "deploy": "Vercel"
}
```

## .env Değişkenleri

`.env.example` ve `.env.local` olarak iki dosya oluştur. `.env.local` `.gitignore`'a.

```
# Clerk — clerk.com'dan app oluştur
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon — neon.tech'ten project oluştur
DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require

# Stripe — test mode
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Benim SaaS
NEXT_PUBLIC_BRAND_COLOR=#2563eb

# Email (opsiyonel)
RESEND_API_KEY=
```

## Veritabanı Şeması (Drizzle)

`lib/schema.ts`:

```typescript
import {
  pgTable, text, timestamp, uuid, jsonb, integer, boolean, uniqueIndex
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  fullName: text("full_name"),
  brandName: text("brand_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
}, (t) => ({
  emailIdx: uniqueIndex("profiles_email_idx").on(t.email),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique().notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  plan: text("plan", { enum: ["free", "starter", "pro"] }).notNull(),
  status: text("status", { enum: ["active", "past_due", "canceled", "trialing"] }).notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  type: text("type").notNull(),
  source: text("source").notNull(),
  externalId: text("external_id"), // idempotency için
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Event = typeof events.$inferSelect;
```

## Sayfa / Route Yapısı

```
app/
├── layout.tsx                              # ClerkProvider, root HTML
├── page.tsx                                # Landing (hero + pricing + CTA)
├── globals.css                             # Tailwind import
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx     # Clerk SignIn
│   └── sign-up/[[...sign-up]]/page.tsx     # Clerk SignUp
├── dashboard/
│   └── page.tsx                            # Korumalı, plan görüntüle, upgrade
└── api/
    ├── health/route.ts                     # GET { ok: true }
    └── stripe/
        ├── checkout/route.ts               # POST → Stripe session → redirect
        └── webhook/route.ts                # POST → event handling
```

## API Endpoint'leri Detayı

### `app/api/stripe/checkout/route.ts`
- Auth gerekli (userId)
- Form body `plan` = "starter" | "pro"
- Stripe Checkout session oluştur (`mode: "subscription"`, `line_items: [{price, qty:1}]`, `client_reference_id: userId`, `metadata: {userId, plan}`)
- 303 redirect session.url'e

### `app/api/stripe/webhook/route.ts`
- Auth YOK (Stripe imzasıyla doğrulanır)
- `await req.text()` ile raw body oku (kritik: `req.json()` KULLANMA)
- `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)` ile doğrula
- Idempotency: `events.externalId === event.id` kontrolü, duplicate'se early return
- `events`'e kaydet
- Event type'a göre handle et:
  - `checkout.session.completed` → `subscriptions`'a insert (onConflictDoUpdate)
  - `customer.subscription.updated` → update
  - `customer.subscription.deleted` → update status canceled

### `app/api/health/route.ts`
Basit: `return NextResponse.json({ ok: true, ts: Date.now() })`

## Middleware

`middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/api/stripe/checkout"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Yardımcı Dosyalar

### `lib/db.ts`
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `lib/stripe.ts`
```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PRICE_TO_PLAN: Record<string, "starter" | "pro"> = {
  [process.env.STRIPE_PRICE_ID_STARTER!]: "starter",
  [process.env.STRIPE_PRICE_ID_PRO!]: "pro",
};

export function planFromPriceId(priceId: string): "free" | "starter" | "pro" {
  return PRICE_TO_PLAN[priceId] ?? "free";
}
```

### `lib/auth.ts`
```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";
import { profiles } from "./schema";
import { eq } from "drizzle-orm";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

export async function getOrCreateProfile() {
  const userId = await requireUser();
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  const user = await currentUser();
  const [created] = await db.insert(profiles).values({
    userId,
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  }).returning();
  return created;
}
```

## Landing Sayfası Spec

`app/page.tsx` — Client component DEĞİL, server component.

Bölümler:
1. **Nav** — logo (NEXT_PUBLIC_BRAND_NAME), Giriş, Başla (SignedIn/SignedOut ile toggle)
2. **Hero** — `<h1>{brandName} — [placeholder değer önerisi]</h1>`, `<p>` açıklama, 2 CTA (Ücretsiz dene, Fiyatlar)
3. **Pricing** (id="pricing") — 3 kart grid (Free, Starter, Pro) — her kartta özellikler

Tasarım: minimalist, sadece Tailwind kullan, `border-neutral-200`, `text-neutral-900`, `bg-white`.

## Dashboard Spec

`app/dashboard/page.tsx` — async server component.

1. `getOrCreateProfile()` çağır
2. Son subscription'ı çek (userId + ORDER BY createdAt DESC LIMIT 1)
3. Plan değerine göre görüntü:
   - Free → "Starter'a yükselt" formu (`<form action="/api/stripe/checkout" method="POST">`)
   - Paid → plan adı + status
4. 3 kart grid: Plan, Hesap, Durum
5. "Başlarken" bölümü — 3 adımlı rehber (profil tamamla, yükselt, API key)

## Kabul Kriterleri (Agent test etmeli)

- [ ] `pnpm install` hata vermeden tamamlanır
- [ ] `pnpm db:generate && pnpm db:migrate` çalışır (3 tablo oluşur)
- [ ] `pnpm dev` → http://localhost:3000 açılır, landing gözükür
- [ ] Sign-up → yeni user yaratılır, Clerk'te gözükür
- [ ] `/dashboard` redirect değil, girilebilir
- [ ] `profiles` tablosunda otomatik row yaratılır (ilk ziyaret)
- [ ] Stripe test card `4242 4242 4242 4242` ile checkout tamamlanır
- [ ] Webhook Stripe CLI (`stripe listen`) ile test edilir, `subscriptions` row'u gelir
- [ ] `/api/health` 200 döner

## Adım Adım Build Talimatı (Claude Code için)

1. `package.json` oluştur (yukarıdaki yığına göre)
2. `tsconfig.json` strict mode, `paths: { "@/*": ["./*"] }`
3. `next.config.ts` (experimental: { reactCompiler: true })
4. `drizzle.config.ts` (postgresql, `./lib/schema.ts`)
5. `postcss.config.mjs` (Tailwind v4 için `@tailwindcss/postcss`)
6. `app/globals.css` — `@import "tailwindcss";`
7. `lib/schema.ts` (yukarıdaki tam kod)
8. `lib/db.ts`, `lib/stripe.ts`, `lib/auth.ts`
9. `middleware.ts`
10. `app/layout.tsx` (ClerkProvider wrap, lang="tr")
11. `app/page.tsx` (landing, server component)
12. `app/(auth)/sign-in/[[...sign-in]]/page.tsx` (`<SignIn />`)
13. `app/(auth)/sign-up/[[...sign-up]]/page.tsx` (`<SignUp />`)
14. `app/dashboard/page.tsx` (async server, plan display)
15. `app/api/stripe/checkout/route.ts`
16. `app/api/stripe/webhook/route.ts`
17. `app/api/health/route.ts`
18. `.env.example`
19. `.gitignore` (node_modules, .next, .env*, .vercel, .turbo)
20. `README.md` — kurulum adımları

Son olarak `pnpm install`, `pnpm dev` çalıştır, browser'da /sign-up → /dashboard akışını test et.

## Önemli Uyarılar

- **Clerk user ID primary key** — ayrı `users` tablosu açma, Clerk'i source of truth tut
- **Webhook raw body** — `req.text()`, `req.json()` değil
- **Idempotency** — her Stripe event `events.externalId`'e yazılır, duplicate kontrolü
- **Server → client ayrımı** — `auth()` ve `currentUser()` server'da; `useUser()` client'ta
- **Neon HTTP driver** — edge runtime değil, default Node runtime
