import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    userId: text("user_id").primaryKey(),
    email: text("email").notNull(),
    fullName: text("full_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (t) => ({ emailIdx: uniqueIndex("profiles_email_idx").on(t.email) })
);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  city: text("city"),
  plan: text("plan", { enum: ["baslangic", "takim", "kurumsal"] }).default("baslangic").notNull(),
  maxBrokers: integer("max_brokers").default(1).notNull(),
  maxLeadsPerMonth: integer("max_leads_per_month").default(100).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ownerUserId: text("owner_user_id"),
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
  tenantId: uuid("tenant_id"),
  dailyLeadLimit: integer("daily_lead_limit").default(10),
  currentMonthLeads: integer("current_month_leads").default(0),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0"),
  avgResponseTimeMinutes: integer("avg_response_time_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    refNo: text("ref_no").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),

    city: text("city").notNull(),
    district: text("district").notNull(),
    neighborhood: text("neighborhood"),
    addressFull: text("address_full"),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),

    propertyType: text("property_type", {
      enum: ["konut", "isyeri", "arsa", "daire", "villa", "mustakil"],
    }).notNull(),
    listingType: text("listing_type", { enum: ["satilik", "kiralik"] }).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("TRY").notNull(),
    sqm: integer("sqm"),
    sqmNet: integer("sqm_net"),
    rooms: text("rooms"),
    floor: text("floor"),
    totalFloors: integer("total_floors"),
    buildingAge: integer("building_age"),
    heating: text("heating"),
    parking: boolean("parking").default(false),
    furnished: boolean("furnished").default(false),

    status: text("status", {
      enum: ["aktif", "satildi", "kiralandi", "beklemede"],
    }).default("aktif").notNull(),
    isFeatured: boolean("is_featured").default(false),

    images: jsonb("images").$type<string[]>().default([]),
    videoUrl: text("video_url"),
    externalId: text("external_id"),
    externalSource: text("external_source"),

    brokerUserId: text("broker_user_id"),
    viewCount: integer("view_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    cityDistrictIdx: index("listings_city_district_idx").on(t.city, t.district),
    typeStatusIdx: index("listings_type_status_idx").on(t.listingType, t.status),
    priceIdx: index("listings_price_idx").on(t.price),
    externalIdx: uniqueIndex("listings_external_id_idx").on(t.externalId),
  })
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),

    listingType: text("listing_type", { enum: ["satilik", "kiralik"] }),
    propertyType: text("property_type"),
    district: text("district"),
    city: text("city"),
    budgetMin: numeric("budget_min", { precision: 12, scale: 2 }),
    budgetMax: numeric("budget_max", { precision: 12, scale: 2 }),
    roomsPreference: text("rooms_preference"),
    notes: text("notes"),

    stage: text("stage", {
      enum: ["yeni", "iletisime_gecildi", "gorusme", "teklif", "sozlesme", "kapandi", "kaybedildi"],
    }).default("yeni").notNull(),
    source: text("source", {
      enum: ["sahibinden", "hurriyetemlak", "zingat", "facebook_ads", "instagram", "tavsiye", "direkt", "diger"],
    }).default("diger").notNull(),
    sourceListingId: uuid("source_listing_id").references(() => listings.id),

    score: integer("score").default(0),
    assignedBrokerId: text("assigned_broker_id"),
    assignedAt: timestamp("assigned_at"),
    daysInStage: integer("days_in_stage").default(0),
    stageChangedAt: timestamp("stage_changed_at").defaultNow(),

    nextFollowUpAt: timestamp("next_follow_up_at"),
    lastContactedAt: timestamp("last_contacted_at"),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stageIdx: index("leads_stage_idx").on(t.stage),
    brokerIdx: index("leads_broker_idx").on(t.assignedBrokerId),
    followUpIdx: index("leads_follow_up_idx").on(t.nextFollowUpAt),
    scoreIdx: index("leads_score_idx").on(t.score),
  })
);

export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  channel: text("channel", {
    enum: ["telefon", "whatsapp", "sms", "email", "yuzyuze", "not"],
  }).notNull(),
  direction: text("direction", { enum: ["giden", "gelen"] }).notNull(),
  content: text("content"),
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const actionPlans = pgTable("action_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  steps: jsonb("steps")
    .$type<Array<{
      day: number;
      type: "whatsapp" | "arama" | "email" | "gorev";
      template: string;
      assignTo: "sorumlu_broker" | "ofis_yoneticisi";
    }>>()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadActionLogs = pgTable("lead_action_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => actionPlans.id),
  stepIndex: integer("step_index").default(0).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  executedAt: timestamp("executed_at"),
  result: text("result", { enum: ["pending", "sent", "failed", "skipped"] }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedFilters = pgTable("saved_filters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  filters: jsonb("filters").$type<Record<string, unknown>>().default({}),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Plan limits ───────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<string, { maxBrokers: number; maxLeadsPerMonth: number; label: string }> = {
  baslangic: { maxBrokers: 1,         maxLeadsPerMonth: 100,  label: "Başlangıç" },
  takim:     { maxBrokers: 10,        maxLeadsPerMonth: 1000, label: "Takım"     },
  kurumsal:  { maxBrokers: Infinity,  maxLeadsPerMonth: 99999, label: "Kurumsal" },
};

// ── Types ──────────────────────────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type Broker = typeof brokers.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type LeadInteraction = typeof leadInteractions.$inferSelect;
export type ActionPlan = typeof actionPlans.$inferSelect;
export type LeadActionLog = typeof leadActionLogs.$inferSelect;
export type SavedFilter = typeof savedFilters.$inferSelect;

export type LeadStage =
  | "yeni" | "iletisime_gecildi" | "gorusme" | "teklif"
  | "sozlesme" | "kapandi" | "kaybedildi";

export type LeadSource =
  | "sahibinden" | "hurriyetemlak" | "zingat" | "facebook_ads"
  | "instagram" | "tavsiye" | "direkt" | "diger";

export const STAGE_LABELS: Record<LeadStage, string> = {
  yeni:             "Yeni",
  iletisime_gecildi:"İletişime Geçildi",
  gorusme:          "Görüşme",
  teklif:           "Teklif",
  sozlesme:         "Sözleşme",
  kapandi:          "Kapandı",
  kaybedildi:       "Kaybedildi",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  sahibinden:   "Sahibinden",
  hurriyetemlak:"Hürriyet Emlak",
  zingat:       "Zingat",
  facebook_ads: "Facebook Ads",
  instagram:    "Instagram",
  tavsiye:      "Tavsiye",
  direkt:       "Direkt",
  diger:        "Diğer",
};

export const STAGE_ORDER: LeadStage[] = [
  "yeni", "iletisime_gecildi", "gorusme", "teklif", "sozlesme", "kapandi", "kaybedildi"
];
