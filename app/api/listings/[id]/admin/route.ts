import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getListingById, updateListing, deleteListing } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.string().optional(),
  status: z.enum(["aktif", "satildi", "kiralandi", "beklemede"]).optional(),
  isFeatured: z.boolean().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  sqm: z.number().int().positive().optional(),
  sqmNet: z.number().int().positive().optional(),
  rooms: z.string().optional(),
  floor: z.string().optional(),
  totalFloors: z.number().int().positive().optional(),
  buildingAge: z.number().int().min(0).optional(),
  heating: z.string().optional(),
  parking: z.boolean().optional(),
  furnished: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
  brokerUserId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Broker sadece kendi ilanını düzenleyebilir; admin hepsini
  if (caller.broker.role !== "admin" && listing.brokerUserId !== caller.user.id) {
    return NextResponse.json({ error: "Bu ilanı düzenleme yetkiniz yok" }, { status: 403 });
  }

  const result = patchSchema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  await updateListing(id, result.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (caller.broker.role !== "admin" && listing.brokerUserId !== caller.user.id) {
    return NextResponse.json({ error: "Bu ilanı silme yetkiniz yok" }, { status: 403 });
  }

  await deleteListing(id);
  return NextResponse.json({ ok: true });
}
