/**
 * Supabase client wrapper — communicates over HTTPS (port 443).
 */
import { createAdminClient } from "./supabase/admin";
import type { Listing, Lead, LeadInteraction, Broker, LeadStage } from "./schema";

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
  const { error } = await getDb().from("listings")
    .update({ ...camelToSnakeListing(values), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await getDb().from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function incrementViewCount(id: string, current: number): Promise<void> {
  await getDb().from("listings").update({ view_count: current + 1 }).eq("id", id);
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function getLeads(filters: {
  stage?: string;
  status?: string;
  source?: string;
  brokerId?: string;
  smartList?: string;
  limit?: number;
} = {}): Promise<Lead[]> {
  const sb = getDb();
  let q = sb.from("leads").select("*");

  if (filters.stage) q = q.eq("stage", filters.stage);
  if (filters.source) q = q.eq("source_new", filters.source);
  if (filters.brokerId) q = q.eq("assigned_broker_id", filters.brokerId);

  const now = new Date();
  if (filters.smartList) {
    switch (filters.smartList) {
      case "bugun_takip": {
        const start = new Date(now); start.setHours(0,0,0,0);
        const end   = new Date(now); end.setHours(23,59,59,999);
        q = q.gte("next_follow_up_at", start.toISOString()).lte("next_follow_up_at", end.toISOString());
        break;
      }
      case "sessiz_7": {
        const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        q = q.or(`last_contacted_at.lt.${cutoff.toISOString()},last_contacted_at.is.null`);
        q = q.not("stage", "in", '("kapandi","kaybedildi")');
        break;
      }
      case "yuksek_skor": {
        q = q.gte("score", 70).eq("stage", "yeni");
        break;
      }
      case "bu_hafta_kapandi": {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        q = q.eq("stage", "kapandi").gte("updated_at", weekStart.toISOString());
        break;
      }
      case "kaybedilen_30": {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        q = q.eq("stage", "kaybedildi").gte("updated_at", monthAgo.toISOString());
        break;
      }
    }
  }

  q = q.order("created_at", { ascending: false }).limit(filters.limit ?? 200);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(snakeToCamelLead);
}

export async function getLeadsByStage(): Promise<Record<LeadStage, Lead[]>> {
  const { data, error } = await getDb()
    .from("leads")
    .select("*")
    .not("stage", "in", '("kapandi","kaybedildi")')
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;

  const map: Record<string, Lead[]> = {};
  for (const row of data ?? []) {
    const lead = snakeToCamelLead(row);
    const s = lead.stage ?? "yeni";
    if (!map[s]) map[s] = [];
    map[s].push(lead);
  }
  return map as Record<LeadStage, Lead[]>;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await getDb().from("leads").select("*").eq("id", id).single();
  if (error) return null;
  return snakeToCamelLead(data);
}

export async function createLead(values: {
  fullName: string; phone: string; email?: string; notes?: string;
  sourceListingId?: string; source?: string; listingType?: string;
  propertyType?: string; district?: string; city?: string;
  budgetMin?: string; budgetMax?: string; roomsPreference?: string;
  stage?: string; score?: number; assignedBrokerId?: string; assignedAt?: string;
}): Promise<{ id: string }> {
  const row: Record<string, unknown> = {
    full_name:         values.fullName,
    phone:             values.phone,
    email:             values.email ?? null,
    notes:             values.notes ?? null,
    source_listing_id: values.sourceListingId ?? null,
    source:            "diger",           // legacy column kept
    source_new:        values.source ?? "diger",
    listing_type:      values.listingType ?? null,
    property_type:     values.propertyType ?? null,
    district:          values.district ?? null,
    city:              values.city ?? null,
    budget_min:        values.budgetMin ?? null,
    budget_max:        values.budgetMax ?? null,
    rooms_preference:  values.roomsPreference ?? null,
    stage:             values.stage ?? "yeni",
    score:             values.score ?? 0,
    assigned_broker_id: values.assignedBrokerId ?? null,
    assigned_at:       values.assignedAt ?? null,
    stage_changed_at:  new Date().toISOString(),
  };
  const { data, error } = await getDb().from("leads").insert(row).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, values: Record<string, unknown>): Promise<void> {
  const mapped: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ("stage" in values) {
    mapped.stage = values.stage;
    mapped.stage_changed_at = new Date().toISOString();
    mapped.days_in_stage = 0;
  }
  if ("assignedBrokerId" in values) mapped.assigned_broker_id = values.assignedBrokerId;
  if ("assignedAt" in values) mapped.assigned_at = values.assignedAt;
  if ("nextFollowUpAt" in values) mapped.next_follow_up_at = values.nextFollowUpAt;
  if ("lastContactedAt" in values) mapped.last_contacted_at = values.lastContactedAt;
  if ("notes" in values) mapped.notes = values.notes;
  if ("score" in values) mapped.score = values.score;
  const { error } = await getDb().from("leads").update(mapped).eq("id", id);
  if (error) throw error;
}

// ── Lead Interactions ─────────────────────────────────────────────────────────

export async function getInteractions(leadId: string): Promise<LeadInteraction[]> {
  const { data, error } = await getDb()
    .from("lead_interactions").select("*").eq("lead_id", leadId)
    .order("created_at", { ascending: false });
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

  // Update last_contacted_at on the lead
  await getDb().from("leads").update({ last_contacted_at: new Date().toISOString() }).eq("id", values.leadId);

  return data;
}

// ── Brokers ───────────────────────────────────────────────────────────────────

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

/** Speed-to-lead: müsait en uygun broker'ı bul */
export async function findAvailableBroker(budgetMax?: number): Promise<Broker | null> {
  const brokers = await getBrokers(true);
  if (!brokers.length) return null;

  const today = new Date().toDateString();
  const eligible = brokers.filter((b) => (b.currentMonthLeads ?? 0) < (b.dailyLeadLimit ?? 10));
  if (!eligible.length) return brokers[0]; // fallback: least loaded

  // Bütçe > 2M TL ise kıdemli broker (admin > broker) öncelikli
  if (budgetMax && budgetMax > 2_000_000) {
    const senior = eligible.find((b) => b.role === "admin") ?? eligible[0];
    return senior;
  }

  // Round-robin: en az lead alan
  eligible.sort((a, b) => (a.currentMonthLeads ?? 0) - (b.currentMonthLeads ?? 0));
  return eligible[0];
}

/** Broker'ın bu ayki lead sayısını artır */
export async function incrementBrokerLeadCount(brokerId: string): Promise<void> {
  const broker = await getBrokerById(brokerId);
  if (!broker) return;
  await getDb().from("brokers").update({
    current_month_leads: (broker.currentMonthLeads ?? 0) + 1,
  }).eq("user_id", brokerId);
}

// ── Tenants ───────────────────────────────────────────────────────────────────

export async function getTenantByOwner(ownerUserId: string) {
  const { data } = await getDb().from("tenants").select("*").eq("owner_user_id", ownerUserId).single();
  return data ?? null;
}

export async function getTenantBrokerCount(tenantId: string): Promise<number> {
  const { count } = await getDb().from("brokers")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true);
  return count ?? 0;
}

// ── Action Plans ──────────────────────────────────────────────────────────────

export async function getDefaultActionPlan() {
  const { data } = await getDb()
    .from("action_plans").select("*").eq("is_default", true).eq("is_active", true).limit(1).single();
  return data ?? null;
}

export async function createActionLog(values: {
  leadId: string; planId: string; stepIndex: number; scheduledFor?: string;
}): Promise<void> {
  await getDb().from("lead_action_logs").insert({
    lead_id:      values.leadId,
    plan_id:      values.planId,
    step_index:   values.stepIndex,
    scheduled_for: values.scheduledFor ?? new Date().toISOString(),
    result:       "pending",
  });
}

export async function getPendingActionLogs(date: Date) {
  const start = new Date(date); start.setHours(0,0,0,0);
  const end   = new Date(date); end.setHours(23,59,59,999);
  const { data, error } = await getDb()
    .from("lead_action_logs")
    .select("*, leads(*), action_plans(*)")
    .eq("result", "pending")
    .gte("scheduled_for", start.toISOString())
    .lte("scheduled_for", end.toISOString());
  if (error) throw error;
  return data ?? [];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const sb = getDb();
  const weekAgo   = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [total, active, leads, newLeads, brokers, closedMonth] = await Promise.all([
    sb.from("listings").select("id", { count: "exact", head: true }),
    sb.from("listings").select("id", { count: "exact", head: true }).eq("status", "aktif"),
    sb.from("leads").select("id", { count: "exact", head: true }),
    sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    sb.from("brokers").select("id", { count: "exact", head: true }).eq("is_active", true),
    sb.from("leads").select("id,budget_max", { count: "exact" })
      .eq("stage", "kapandi").gte("updated_at", monthAgo),
  ]);
  const totalCiro = (closedMonth.data ?? []).reduce((s, r) => s + (parseFloat(r.budget_max ?? "0") || 0), 0);
  return {
    totalListings:  total.count ?? 0,
    activeListings: active.count ?? 0,
    totalLeads:     leads.count ?? 0,
    newLeads:       newLeads.count ?? 0,
    activeBrokers:  brokers.count ?? 0,
    closedThisMonth: closedMonth.count ?? 0,
    totalCiroThisMonth: totalCiro,
  };
}

export async function getBrokerStats() {
  const sb = getDb();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [brokersData, leadsData, interactionsData] = await Promise.all([
    sb.from("brokers").select("*").eq("is_active", true),
    sb.from("leads").select("*").gte("created_at", monthAgo),
    sb.from("lead_interactions").select("*").gte("created_at", monthAgo),
  ]);

  const brokers   = (brokersData.data ?? []).map(snakeToCamelBroker);
  const leads     = (leadsData.data ?? []).map(snakeToCamelLead);
  const interactions = interactionsData.data ?? [];

  return brokers.map((b) => {
    const bLeads   = leads.filter((l) => l.assignedBrokerId === b.userId);
    const closed   = bLeads.filter((l) => l.stage === "kapandi");
    const pipeline = bLeads
      .filter((l) => !["kapandi","kaybedildi"].includes(l.stage ?? ""))
      .reduce((s, l) => s + (parseFloat(l.budgetMax ?? "0") || 0), 0);
    const bInter   = interactions.filter((i) => i.created_by_user_id === b.userId);
    const calls    = bInter.filter((i: { channel: string }) => i.channel === "telefon").length;
    const waMsgs   = bInter.filter((i: { channel: string }) => i.channel === "whatsapp").length;
    const conv     = bLeads.length > 0 ? Math.round((closed.length / bLeads.length) * 100) : 0;
    return {
      broker:            b,
      assignedLeads:     bLeads.length,
      closedLeads:       closed.length,
      conversionRate:    conv,
      pipelineValue:     pipeline,
      calls,
      waMsgs,
      avgResponseTime:   b.avgResponseTimeMinutes ?? 0,
    };
  });
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
    externalId: r.external_id, externalSource: r.external_source,
    brokerUserId: r.broker_user_id, viewCount: r.view_count,
    createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function camelToSnakeListing(v: Partial<Listing>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (v.refNo       !== undefined) r.ref_no       = v.refNo;
  if (v.title       !== undefined) r.title        = v.title;
  if (v.description !== undefined) r.description  = v.description;
  if (v.city        !== undefined) r.city         = v.city;
  if (v.district    !== undefined) r.district     = v.district;
  if (v.neighborhood!== undefined) r.neighborhood = v.neighborhood;
  if (v.addressFull !== undefined) r.address_full = v.addressFull;
  if (v.propertyType!== undefined) r.property_type= v.propertyType;
  if (v.listingType !== undefined) r.listing_type = v.listingType;
  if (v.price       !== undefined) r.price        = v.price;
  if (v.currency    !== undefined) r.currency     = v.currency;
  if (v.sqm         !== undefined) r.sqm          = v.sqm;
  if (v.sqmNet      !== undefined) r.sqm_net      = v.sqmNet;
  if (v.rooms       !== undefined) r.rooms        = v.rooms;
  if (v.floor       !== undefined) r.floor        = v.floor;
  if (v.totalFloors !== undefined) r.total_floors = v.totalFloors;
  if (v.buildingAge !== undefined) r.building_age = v.buildingAge;
  if (v.heating     !== undefined) r.heating      = v.heating;
  if (v.parking     !== undefined) r.parking      = v.parking;
  if (v.furnished   !== undefined) r.furnished    = v.furnished;
  if (v.status      !== undefined) r.status       = v.status;
  if (v.isFeatured  !== undefined) r.is_featured  = v.isFeatured;
  if (v.images      !== undefined) r.images       = v.images;
  if (v.videoUrl    !== undefined) r.video_url    = v.videoUrl;
  if (v.brokerUserId!== undefined) r.broker_user_id= v.brokerUserId;
  if (v.externalId  !== undefined) r.external_id  = v.externalId;
  if (v.externalSource!==undefined)r.external_source=v.externalSource;
  return r;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelLead(r: any): Lead {
  return {
    id:               r.id,
    fullName:         r.full_name,
    phone:            r.phone,
    email:            r.email,
    listingType:      r.listing_type,
    propertyType:     r.property_type,
    district:         r.district,
    city:             r.city,
    budgetMin:        r.budget_min,
    budgetMax:        r.budget_max,
    roomsPreference:  r.rooms_preference,
    notes:            r.notes,
    stage:            r.stage ?? "yeni",
    source:           r.source_new ?? r.source ?? "diger",
    sourceListingId:  r.source_listing_id,
    assignedBrokerId: r.assigned_broker_id,
    assignedAt:       r.assigned_at ? new Date(r.assigned_at) : null,
    score:            r.score ?? 0,
    daysInStage:      r.days_in_stage ?? 0,
    stageChangedAt:   r.stage_changed_at ? new Date(r.stage_changed_at) : null,
    nextFollowUpAt:   r.next_follow_up_at ? new Date(r.next_follow_up_at) : null,
    lastContactedAt:  r.last_contacted_at ? new Date(r.last_contacted_at) : null,
    metadata:         r.metadata,
    createdAt:        new Date(r.created_at),
    updatedAt:        new Date(r.updated_at),
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
    userId:                 r.user_id,
    fullName:               r.full_name,
    phone:                  r.phone,
    email:                  r.email,
    role:                   r.role,
    isActive:               r.is_active,
    officeName:             r.office_name,
    dailyLeadLimit:         r.daily_lead_limit ?? 10,
    tenantId:               r.tenant_id ?? null,
    currentMonthLeads:      r.current_month_leads ?? 0,
    conversionRate:         r.conversion_rate ?? "0",
    avgResponseTimeMinutes: r.avg_response_time_minutes ?? 0,
    createdAt:              new Date(r.created_at),
  };
}
