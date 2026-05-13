# 02 — Emlak Ofisi Yönetim Projesi

> İlan sitesi + lead CRM + AI eşleştirme + WhatsApp takip. Bir emlak ofisi 2 haftada canlıya çıkar.

## Proje Özeti

Lokal emlak ofisi için:
- Kendi domaininde ilan listeleme sitesi (sahibinden alternatifi)
- Lead'lerin kaybolmadığı CRM
- Müşteri "Ataşehir 3+1 satılık 7M altı" diyince AI önerir, WhatsApp'la yollar
- Lead geldi → broker'a 5 saniyede WhatsApp alarmı
- 24 saat sessiz kaldı → hatırlatma
- Satış sonrası → Google review isteği

**Son kullanıcı:** 1-5 çalışanlı lokal emlak ofisi. Ayda 20-30 lead alan, satış-odaklı küçük şirketler.

## Hedef Müşteri

- Emlak ofisi sahibi (broker) veya yönetici
- Remax/Century21 değil — lokal bağımsız ofisler
- Şu an Sahibinden/Emlakjet'e bağımlı
- WhatsApp'tan lead alıyor ama sistemli takip yok
- Ayda 2-3 satışla yaşıyor, her lead kritik

## Fiyat Modeli

- **Temel:** $800 kurulum + $150/ay — site + 10 ilan + WhatsApp alert
- **Plus:** $1200 + $250/ay — + AI eşleştirme + drip email + semt landing
- **Pro:** $1500 + $300/ay — + IG auto-DM + Google Ads yönetimi + aylık danışmanlık

## Teknoloji Yığını

```json
{
  "base": "Mikro SaaS Başlangıç (spec 01)",
  "eklenti": {
    "zod": "^3.23",
    "anthropic": "@anthropic-ai/sdk ^0.32",
    "blob": "@vercel/blob",
    "maps": "mapbox-gl veya Google Maps Static"
  },
  "n8n": "self-host veya n8n.cloud",
  "whatsapp": "Meta WhatsApp Business Cloud API"
}
```

## .env Değişkenleri

Spec 01'deki değişkenlere ek olarak:

```
# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# WhatsApp Meta
WHATSAPP_META_TOKEN=EAAxxx
WHATSAPP_PHONE_NUMBER_ID=12345

# n8n
N8N_WEBHOOK_LEAD=https://n8n.xxx.com/webhook/emlak-lead
N8N_WEBHOOK_MATCH_WHATSAPP=https://n8n.xxx.com/webhook/emlak-match

# Ofis
NEXT_PUBLIC_OFFICE_NAME=Ataşehir Emlak
NEXT_PUBLIC_OFFICE_PHONE=+902165551234
NEXT_PUBLIC_OFFICE_ADDRESS=Barbaros Mah. xxx Sk. No:5 Ataşehir/İstanbul
NEXT_PUBLIC_OFFICE_INSTAGRAM=@atasehir_emlak
BROKER_WHATSAPP=+905551234567

# Blob (fotoğraf)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
```

## Veritabanı Şeması

Spec 01'deki `profiles`, `subscriptions`, `events` tabloları + şunlar:

```typescript
import {
  pgTable, text, timestamp, uuid, integer, numeric,
  boolean, jsonb, index
} from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  refNo: text("ref_no").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),

  // Konum
  city: text("city").notNull(),
  district: text("district").notNull(),
  neighborhood: text("neighborhood"),
  addressFull: text("address_full"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),

  // Özellikler
  propertyType: text("property_type", {
    enum: ["konut", "isyeri", "arsa", "daire", "villa", "mustakil"]
  }).notNull(),
  listingType: text("listing_type", { enum: ["satilik", "kiralik"] }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("TRY").notNull(),
  sqm: integer("sqm"),
  sqmNet: integer("sqm_net"),
  rooms: text("rooms"),          // "3+1"
  floor: text("floor"),
  totalFloors: integer("total_floors"),
  buildingAge: integer("building_age"),
  heating: text("heating"),
  parking: boolean("parking").default(false),
  furnished: boolean("furnished").default(false),

  status: text("status", {
    enum: ["aktif", "satildi", "kiralandi", "beklemede"]
  }).default("aktif").notNull(),
  isFeatured: boolean("is_featured").default(false),

  images: jsonb("images").$type<string[]>().default([]),
  videoUrl: text("video_url"),

  brokerUserId: text("broker_user_id"),
  viewCount: integer("view_count").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  cityDistrictIdx: index("listings_city_district_idx").on(t.city, t.district),
  typeStatusIdx: index("listings_type_status_idx").on(t.listingType, t.status),
  priceIdx: index("listings_price_idx").on(t.price),
}));

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),

  listingType: text("listing_type", { enum: ["satilik", "kiralik"] }),
  propertyType: text("property_type"),
  district: text("district"),
  budgetMin: numeric("budget_min", { precision: 12, scale: 2 }),
  budgetMax: numeric("budget_max", { precision: 12, scale: 2 }),
  roomsPreference: text("rooms_preference"),
  notes: text("notes"),

  status: text("status", {
    enum: ["yeni", "aranildi", "gorusme", "teklif", "kapandi", "kaybedildi"]
  }).default("yeni").notNull(),
  source: text("source", {
    enum: ["form", "whatsapp", "instagram", "telefon", "referans", "ilan"]
  }).notNull(),
  sourceListingId: uuid("source_listing_id").references(() => listings.id),

  assignedBrokerId: text("assigned_broker_id"),

  nextFollowUpAt: timestamp("next_follow_up_at"),
  lastContactedAt: timestamp("last_contacted_at"),

  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  statusIdx: index("leads_status_idx").on(t.status),
  brokerIdx: index("leads_broker_idx").on(t.assignedBrokerId),
  followUpIdx: index("leads_follow_up_idx").on(t.nextFollowUpAt),
}));

export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  channel: text("channel", {
    enum: ["telefon", "whatsapp", "sms", "email", "yuzyuze", "not"]
  }).notNull(),
  direction: text("direction", { enum: ["giden", "gelen"] }).notNull(),
  content: text("content"),
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brokers = pgTable("brokers", {
  userId: text("user_id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "broker", "stajyer"] }).default("broker").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  officeName: text("office_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Broker = typeof brokers.$inferSelect;
```

## Sayfa Yapısı

```
app/
├── page.tsx                              # Landing: hero + 6 featured ilan + FAQ + CTA
├── ilanlar/page.tsx                      # Tüm ilanlar (filter + grid)
├── ilan/[id]/page.tsx                    # İlan detay + LeadForm + WhatsApp butonu
├── brokerlarimiz/page.tsx                # Broker kadrosu
├── iletisim/page.tsx                     # Adres + Google Maps + LeadForm (generic)
├── admin/
│   ├── page.tsx                          # Dashboard (bu haftaki lead, en popüler ilan)
│   ├── ilanlar/page.tsx                  # İlan listesi + yeni ekleme
│   ├── ilanlar/[id]/duzenle/page.tsx     # İlan düzenle
│   ├── ilanlar/yeni/page.tsx             # Yeni ilan formu (fotoğraf upload)
│   ├── leads/page.tsx                    # Lead listesi + filter + atama
│   ├── leads/[id]/page.tsx               # Lead detay + interaction log + notes
│   ├── brokerlar/page.tsx                # Broker yönetimi
│   └── ayarlar/page.tsx                  # Ofis bilgileri, WhatsApp numaralar
└── api/
    ├── leads/route.ts                    # POST yarat → n8n webhook
    ├── leads/[id]/route.ts               # PATCH status, DELETE
    ├── leads/[id]/interactions/route.ts  # POST interaction ekle
    ├── listings/route.ts                 # GET filter, POST create
    ├── listings/[id]/route.ts            # GET, PATCH, DELETE
    ├── listings/upload/route.ts          # POST fotoğraf → Vercel Blob
    └── agent/match/route.ts              # POST {query, phone} → AI eşleştirme
```

## API Endpoint'leri

### `POST /api/leads`

Zod ile doğrula:
```typescript
const LeadInput = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  sourceListingId: z.string().uuid().optional(),
  source: z.enum(["form", "whatsapp", "instagram", "telefon", "referans", "ilan"]),
});
```

- Telefon normalize et: `+90XXXXXXXXXX` formatına (regex ile rakam dışı temizle, başına +90)
- `leads`'e insert
- `fetch(N8N_WEBHOOK_LEAD, {...lead})` fire-and-forget (.catch ile swallow)
- Return `{ ok: true, id }`

### `GET /api/listings?city=&district=&listingType=&rooms=&maxPrice=&page=`

- status='aktif' default
- Server-side filter (Drizzle `and()` + conditionally)
- Pagination: page=1, limit=20
- Return `{ items, total, page }`

### `POST /api/agent/match`

Anthropic SDK kullan:

```typescript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { query, phone } = await req.json();

  const availableListings = await db.select({
    id: listings.id, title: listings.title, district: listings.district,
    neighborhood: listings.neighborhood, price: listings.price, rooms: listings.rooms,
    sqm: listings.sqm, listingType: listings.listingType,
  }).from(listings).where(eq(listings.status, "aktif")).limit(50);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: PROPERTY_MATCHER_PROMPT, // aşağıda
    messages: [{
      role: "user",
      content: `Müşteri: "${query}"\n\nİlanlar:\n${JSON.stringify(availableListings, null, 2)}`,
    }],
  });

  const parsed = JSON.parse(
    response.content[0].type === "text" ? response.content[0].text : "{}"
  );

  if (phone && parsed.matches?.length > 0) {
    fetch(process.env.N8N_WEBHOOK_MATCH_WHATSAPP!, {
      method: "POST",
      body: JSON.stringify({ phone, matches: parsed.matches, listings: availableListings }),
    }).catch(console.error);
  }

  return NextResponse.json(parsed);
}
```

## AI Prompt: Property Matcher

`PROPERTY_MATCHER_PROMPT` sabiti (`app/api/agent/match/route.ts` içinde):

```
Sen bir emlak asistanısın. Müşteri doğal dille ne aradığını söyleyecek. Senin işin:

1. İsteğini yapılandırılmış filtrelere çevir
2. available_listings'ten en fazla 5 ilan seç
3. Her eşleşme için 1 cümle "neden uygun" açıklaması yaz

Öncelik sırası:
- listingType (satılık/kiralık) zorunlu eşleşme
- district zorunlu (listede yoksa en yakını)
- budget %10 esneklik, "üstünde" diye belirt
- oda ±1 esneklik
- m² ±%20

Çıktı SADECE JSON:
{
  "filters": { listingType, district, propertyType, budgetMin, budgetMax, rooms, sqmMin },
  "matches": [{ "listingId": "uuid", "matchReason": "...", "matchScore": 0.95 }],
  "missingInfo": ["bütçe?", "oda sayısı?"]
}

Bilgi eksikse missingInfo doldur, matches boş. Uygun ilan yoksa missingInfo'ya öneri yaz.
```

## Landing İçerik

`app/page.tsx` placeholder'lar:
- `<h1>{officeName} — [Bölge] Emlak</h1>`
- Alt başlık: "Ataşehir'de 10 yılı aşkın tecrübe. 500+ başarılı satış."
- Hero CTA: "Hayalinizdeki eve bakın" → `/ilanlar`
- Featured 6 ilan: `SELECT FROM listings WHERE isFeatured=true AND status='aktif' LIMIT 6`
- 3 FAQ (kickoff'tan gelir): "Komisyon oranınız?", "Süreç nasıl?", "Hangi bölgelerdesiniz?"
- Footer: adres + telefon + IG

## Component'ler

### `components/ListingCard.tsx`
- Image (aspect-[4/3]), ref_no badge, satılık/kiralık badge
- Title, neighborhood + district, rooms • sqm • floor, fiyat bold

### `components/LeadForm.tsx`
- Client component
- fullName, phone, email (optional), notes (textarea)
- Submit → `POST /api/leads` → state ok/error gösterim
- Props: `listingId?`, `variant: "card" | "inline"`

### `components/SearchFilters.tsx`
- Client, useSearchParams
- 4 field: listingType, district, rooms, maxPrice
- Change → router.push update params

### `components/WhatsAppButton.tsx`
- Floating, fixed bottom-6 right-6
- `wa.me/{phone}?text={message}` linki

## n8n Workflow'ları

### `emlak-lead-alert`
Webhook `POST /webhook/emlak-lead`:
1. Parse lead body
2. Score: `bütçe varsa +40, telefon varsa +20, ilanId varsa +30`
3. Broker'a WhatsApp (HTTP Request → Meta):
   ```
   🔥 YENİ LEAD ({{score}}/100)
   👤 {{fullName}} — 📱 {{phone}}
   {{#listingRef}}İlan: {{listingRef}}{{/listingRef}}
   Notlar: {{notes}}
   ```
4. Müşteriye WhatsApp karşılama:
   ```
   Merhaba {{fullName}}, {{officeName}} olarak en yakın zamanda dönüyoruz.
   ```
5. Wait 24h → Postgres query: `lastContactedAt IS NULL?` → varsa broker'a hatırlatma

### `emlak-match-whatsapp`
Webhook `POST /webhook/emlak-match`:
1. Body: `{phone, matches, listings}`
2. `matches`'i formatla (top 3), her biri için:
   ```
   🏠 {{title}}
   📍 {{neighborhood}}, {{district}}
   💰 {{price}} TL — {{rooms}} — {{sqm}}m²
   🔗 {{siteUrl}}/ilan/{{id}}
   ```
3. WhatsApp'a yolla müşteriye

## Middleware Güncellemesi

Spec 01'deki middleware'e ek olarak `/admin(.*)` korumalı:

```typescript
const isProtected = createRouteMatcher([
  "/admin(.*)",
  "/api/listings(.*)",      // GET hariç — public
  "/api/leads/:id(.*)",      // POST /api/leads public (form submit)
  "/dashboard(.*)"
]);
```

Admin yetki kontrolü: `app/admin/layout.tsx`'te `brokers.role === 'admin' | 'broker'` kontrolü, yoksa redirect `/`.

## Test Verisi Seed'i

`scripts/seed.ts` yaz:
- 10 mock ilan (Ataşehir, Kadıköy, Maltepe)
- 5 mock broker
- 15 mock lead (çeşitli status)

`pnpm tsx scripts/seed.ts` ile çalışsın.

## Kabul Kriterleri

- [ ] `/ilanlar` — 10 seed ilan gözükür, filter çalışır
- [ ] `/ilan/[id]` — detay + fotoğraf galerisi + LeadForm
- [ ] Form submit → lead DB'ye düşer → n8n webhook tetiklenir (test: n8n execution log)
- [ ] `/api/agent/match` → `{"query": "Ataşehir 3+1 7M altı"}` → eşleşme dönor
- [ ] `/admin/leads` → liste, filter, status değiştirme
- [ ] Broker'a WhatsApp test mesajı gidiyor (Meta test numarasına)
- [ ] Fotoğraf upload → Vercel Blob → listing.images'e URL eklenir
- [ ] Lighthouse mobile ≥ 85

## Build Sırası

1. Spec 01'i uygula (SaaS base)
2. `lib/schema.ts`'e listings, leads, leadInteractions, brokers ekle, migrate
3. Seed script + çalıştır
4. `/ilanlar` + ListingCard + SearchFilters
5. `/ilan/[id]` + LeadForm + WhatsAppButton
6. `POST /api/leads` + zod + n8n fetch
7. `/admin` + layout guard + sub-sayfalar
8. `/admin/leads/[id]` + interaction log
9. `app/api/agent/match` + Anthropic
10. Landing featured listings query
11. n8n workflow'ları kur (Meta token lazım)
12. Seed testle end-to-end

## Önemli Uyarılar

- **Telefon normalize** DB'ye yazarken şart (`+905...` formatı)
- **İlan silme** soft delete: `status='beklemede'` yap, row silme
- **Fotoğraf upload** serverless limit'i 4.5MB — büyük dosyaları client-side compress et
- **AI maliyet** — Sonnet 4.6 $0.003/sorgu ~, Haiku daha ucuz ama eşleşme kalitesi düşer
- **WhatsApp template** — Meta onaylı template kullan ilk 24 saat dışı
