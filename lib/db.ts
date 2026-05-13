/**
 * Thin Supabase client wrapper — communicates over HTTPS (port 443), no direct Postgres needed.
 * Replaces Drizzle + postgres.js to avoid firewall issues with ports 5432/6543.
 */
import { createAdminClient } from "./supabase/admin";
import type { Listing, Lead, LeadInteraction, Broker, Profile } from "./schema";

export function getDb() {
  return createAdminClient();
}

// ── Listings ──────────────────────────────────────────────────────────────────

export async function getListings(filters: {
  status?: string;
  listingType?: string;
  propertyType?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<Listing[]> {
  const sb = getDb();
  let q = sb.from("listings").select("*");
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.listingType) q = q.eq("listing_type", filters.listingType);
  if (filters.propertyType) q = q.eq("property_type", filters.propertyType);
  if (filters.district) q = q.eq("district", filters.district);
  if (filters.minPrice) q = q.gte("price", filters.minPrice);
  if (filters.maxPrice) q = q.lte("price", filters.maxPrice);
  if (filters.isFeatured !== undefined) q = q.eq("is_featured", filters.isFeatured);
  q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  if (filters.limit) q = q.limit(filters.limit);
  if (filters.offset) q = q.range(filters.offset, filters.offset + (filters.limit ?? 12) - 1);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(snakeToCamelListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await getDb().from("listings").select("*").eq("id", id).single();
  if (error) return null;
  return snakeToCamelListing(data);
}

export async function createListing(values: Partial<Listing>): Promise<{ id: string }> {
  const { data, error } = await getDb().from("listings").insert(camelToSnakeListing(values)).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, values: Partial<Listing>): Promise<void> {
  const { error } = await getDb().from("listings").update({ ...camelToSnakeListing(values), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await getDb().from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function incrementViewCount(id: string, current: number): Promise<void> {
  await getDb().from("listings").update({ view_count: current + 1 }).eq("id", id);
}

// ── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(filters: { status?: string; source?: string; limit?: number } = {}): Promise<Lead[]> {
  const sb = getDb();
  let q = sb.from("leads").select("*");
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.source) q = q.eq("source", filters.source);
  q = q.order("created_at", { ascending: false }).limit(filters.limit ?? 100);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(snakeToCamelLead);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await getDb().from("leads").select("*").eq("id", id).single();
  if (error) return null;
  return snakeToCamelLead(data);
}

export async function createLead(values: {
  fullName: string; phone: string; email?: string; notes?: string;
  sourceListingId?: string; source: string; listingType?: string;
  propertyType?: string; district?: string; budgetMin?: string; budgetMax?: string;
  roomsPreference?: string; status?: string;
}): Promise<{ id: string }> {
  const row = {
    full_name: values.fullName, phone: values.phone, email: values.email ?? null,
    notes: values.notes ?? null, source_listing_id: values.sourceListingId ?? null,
    source: values.source, listing_type: values.listingType ?? null,
    property_type: values.propertyType ?? null, district: values.district ?? null,
    budget_min: values.budgetMin ?? null, budget_max: values.budgetMax ?? null,
    rooms_preference: values.roomsPreference ?? null, status: values.status ?? "yeni",
  };
  const { data, error } = await getDb().from("leads").insert(row).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, values: Record<string, unknown>): Promise<void> {
  const mapped: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ("status" in values) mapped.status = values.status;
  if ("assignedBrokerId" in values) mapped.assigned_broker_id = values.assignedBrokerId;
  if ("nextFollowUpAt" in values) mapped.next_follow_up_at = values.nextFollowUpAt;
  if ("notes" in values) mapped.notes = values.notes;
  const { error } = await getDb().from("leads").update(mapped).eq("id", id);
  if (error) throw error;
}

// ── Lead Interactions ────────────────────────────────────────────────────────

export async function getInteractions(leadId: string): Promise<LeadInteraction[]> {
  const { data, error } = await getDb().from("lead_interactions").select("*").eq("lead_id", leadId).order("created_at");
  if (error) throw error;
  return (data ?? []).map(snakeToCamelInteraction);
}

export async function createInteraction(values: {
  leadId: string; channel: string; direction: string; content?: string; createdByUserId?: string;
}): Promise<{ id: string }> {
  const { data, error } = await getDb().from("lead_interactions").insert({
    lead_id: values.leadId, channel: values.channel, direction: values.direction,
    content: values.content ?? null, created_by_user_id: values.createdByUserId ?? null,
  }).select("id").single();
  if (error) throw error;
  return data;
}

// ── Brokers ──────────────────────────────────────────────────────────────────

export async function getBrokers(onlyActive = false): Promise<Broker[]> {
  let q = getDb().from("brokers").select("*");
  if (onlyActive) q = q.eq("is_active", true);
  const { data, error } = await q.order("full_name");
  if (error) throw error;
  return (data ?? []).map(snakeToCamelBroker);
}

export async function getBrokerById(userId: string): Promise<Broker | null> {
  const { data, error } = await getDb().from("brokers").select("*").eq("user_id", userId).single();
  if (error) return null;
  return snakeToCamelBroker(data);
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const sb = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [total, active, leads, newLeads, brokers] = await Promise.all([
    sb.from("listings").select("id", { count: "exact", head: true }),
    sb.from("listings").select("id", { count: "exact", head: true }).eq("status", "aktif"),
    sb.from("leads").select("id", { count: "exact", head: true }),
    sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    sb.from("brokers").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return {
    totalListings: total.count ?? 0,
    activeListings: active.count ?? 0,
    totalLeads: leads.count ?? 0,
    newLeads: newLeads.count ?? 0,
    activeBrokers: brokers.count ?? 0,
  };
}

// ── Snake/camel converters ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelListing(r: any): Listing {
  return {
    id: r.id, refNo: r.ref_no, title: r.title, description: r.description,
    city: r.city, district: r.district, neighborhood: r.neighborhood, addressFull: r.address_full,
    lat: r.lat, lng: r.lng,
    propertyType: r.property_type, listingType: r.listing_type,
    price: r.price, currency: r.currency,
    sqm: r.sqm, sqmNet: r.sqm_net, rooms: r.rooms, floor: r.floor,
    totalFloors: r.total_floors, buildingAge: r.building_age,
    heating: r.heating, parking: r.parking, furnished: r.furnished,
    status: r.status, isFeatured: r.is_featured,
    images: r.images, videoUrl: r.video_url,
    brokerUserId: r.broker_user_id, viewCount: r.view_count,
    createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function camelToSnakeListing(v: Partial<Listing>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (v.refNo !== undefined) r.ref_no = v.refNo;
  if (v.title !== undefined) r.title = v.title;
  if (v.description !== undefined) r.description = v.description;
  if (v.city !== undefined) r.city = v.city;
  if (v.district !== undefined) r.district = v.district;
  if (v.neighborhood !== undefined) r.neighborhood = v.neighborhood;
  if (v.addressFull !== undefined) r.address_full = v.addressFull;
  if (v.propertyType !== undefined) r.property_type = v.propertyType;
  if (v.listingType !== undefined) r.listing_type = v.listingType;
  if (v.price !== undefined) r.price = v.price;
  if (v.currency !== undefined) r.currency = v.currency;
  if (v.sqm !== undefined) r.sqm = v.sqm;
  if (v.sqmNet !== undefined) r.sqm_net = v.sqmNet;
  if (v.rooms !== undefined) r.rooms = v.rooms;
  if (v.floor !== undefined) r.floor = v.floor;
  if (v.totalFloors !== undefined) r.total_floors = v.totalFloors;
  if (v.buildingAge !== undefined) r.building_age = v.buildingAge;
  if (v.heating !== undefined) r.heating = v.heating;
  if (v.parking !== undefined) r.parking = v.parking;
  if (v.furnished !== undefined) r.furnished = v.furnished;
  if (v.status !== undefined) r.status = v.status;
  if (v.isFeatured !== undefined) r.is_featured = v.isFeatured;
  if (v.images !== undefined) r.images = v.images;
  if (v.videoUrl !== undefined) r.video_url = v.videoUrl;
  if (v.brokerUserId !== undefined) r.broker_user_id = v.brokerUserId;
  return r;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelLead(r: any): Lead {
  return {
    id: r.id, fullName: r.full_name, phone: r.phone, email: r.email,
    listingType: r.listing_type, propertyType: r.property_type, district: r.district,
    budgetMin: r.budget_min, budgetMax: r.budget_max, roomsPreference: r.rooms_preference,
    notes: r.notes, status: r.status, source: r.source,
    sourceListingId: r.source_listing_id, assignedBrokerId: r.assigned_broker_id,
    nextFollowUpAt: r.next_follow_up_at ? new Date(r.next_follow_up_at) : null,
    lastContactedAt: r.last_contacted_at ? new Date(r.last_contacted_at) : null,
    metadata: r.metadata, createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelInteraction(r: any): LeadInteraction {
  return {
    id: r.id, leadId: r.lead_id, channel: r.channel, direction: r.direction,
    content: r.content, createdByUserId: r.created_by_user_id, createdAt: new Date(r.created_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelBroker(r: any): Broker {
  return {
    userId: r.user_id, fullName: r.full_name, phone: r.phone, email: r.email,
    role: r.role, isActive: r.is_active, officeName: r.office_name, createdAt: new Date(r.created_at),
  };
}
