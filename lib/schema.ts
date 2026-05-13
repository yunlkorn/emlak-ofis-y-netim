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
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),
  },
  (t) => ({
    emailIdx: uniqueIndex("profiles_email_idx").on(t.email),
  })
);

export const brokers = pgTable("brokers", {
  userId: text("user_id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "broker", "stajyer"] })
    .default("broker")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  officeName: text("office_name"),
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
    listingType: text("listing_type", {
      enum: ["satilik", "kiralik"],
    }).notNull(),
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
    })
      .default("aktif")
      .notNull(),
    isFeatured: boolean("is_featured").default(false),

    images: jsonb("images").$type<string[]>().default([]),
    videoUrl: text("video_url"),

    brokerUserId: text("broker_user_id"),
    viewCount: integer("view_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    cityDistrictIdx: index("listings_city_district_idx").on(
      t.city,
      t.district
    ),
    typeStatusIdx: index("listings_type_status_idx").on(
      t.listingType,
      t.status
    ),
    priceIdx: index("listings_price_idx").on(t.price),
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
    budgetMin: numeric("budget_min", { precision: 12, scale: 2 }),
    budgetMax: numeric("budget_max", { precision: 12, scale: 2 }),
    roomsPreference: text("rooms_preference"),
    notes: text("notes"),

    status: text("status", {
      enum: ["yeni", "aranildi", "gorusme", "teklif", "kapandi", "kaybedildi"],
    })
      .default("yeni")
      .notNull(),
    source: text("source", {
      enum: ["form", "whatsapp", "instagram", "telefon", "referans", "ilan"],
    }).notNull(),
    sourceListingId: uuid("source_listing_id").references(() => listings.id),

    assignedBrokerId: text("assigned_broker_id"),

    nextFollowUpAt: timestamp("next_follow_up_at"),
    lastContactedAt: timestamp("last_contacted_at"),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("leads_status_idx").on(t.status),
    brokerIdx: index("leads_broker_idx").on(t.assignedBrokerId),
    followUpIdx: index("leads_follow_up_idx").on(t.nextFollowUpAt),
  })
);

export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  channel: text("channel", {
    enum: ["telefon", "whatsapp", "sms", "email", "yuzyuze", "not"],
  }).notNull(),
  direction: text("direction", { enum: ["giden", "gelen"] }).notNull(),
  content: text("content"),
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Broker = typeof brokers.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type LeadInteraction = typeof leadInteractions.$inferSelect;
export type ListingStatus = "aktif" | "satildi" | "kiralandi" | "beklemede";
export type LeadStatus =
  | "yeni"
  | "aranildi"
  | "gorusme"
  | "teklif"
  | "kapandi"
  | "kaybedildi";
