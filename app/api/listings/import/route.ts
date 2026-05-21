import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, createListing } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const ItemSchema = z.object({
  externalId:   z.string().min(1),
  title:        z.string().min(2),
  price:        z.number().positive(),
  district:     z.string().min(1),
  city:         z.string().min(1),
  neighborhood: z.string().optional(),
  rooms:        z.string().optional(),
  sqm:          z.number().optional(),
  url:          z.string().url().optional(),
  imageUrl:     z.string().url().optional(),
  source:       z.literal("sahibinden"),
});

const BodySchema = z.object({
  items:    z.array(ItemSchema).min(1).max(100),
  dryRun:   z.boolean().default(true),
});

/** GET — Mevcut externalId'leri döndür (duplicate kontrol için) */
export async function GET(req: NextRequest) {
  await requireBrokerRole(["admin"]).catch(() => {
    throw new Response(JSON.stringify({ error: "Yetki gerekli" }), { status: 401 });
  });

  const { data } = await getDb()
    .from("listings")
    .select("external_id")
    .not("external_id", "is", null);

  const ids = (data ?? []).map((r: { external_id: string }) => r.external_id).filter(Boolean);
  return NextResponse.json({ existingIds: ids, count: ids.length });
}

/** POST — İlanları import et (dryRun=true: sadece önizleme, false: DB'ye yaz) */
export async function POST(req: NextRequest) {
  await requireBrokerRole(["admin"]).catch(() => {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  });

  const body   = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { items, dryRun } = parsed.data;

  // Mevcut externalId'leri çek
  const { data: existing } = await getDb()
    .from("listings").select("external_id").not("external_id", "is", null);
  const existingIds = new Set((existing ?? []).map((r: { external_id: string }) => r.external_id));

  const newItems = items.filter((item) => !existingIds.has(item.externalId));
  const dupes    = items.length - newItems.length;

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      total:  items.length,
      new:    newItems.length,
      dupes,
      preview: newItems.slice(0, 5),
    });
  }

  // Gerçek import
  const results: string[] = [];
  const errors: string[]  = [];

  for (const item of newItems) {
    try {
      const refNo = `SHB-${item.externalId.slice(-8).toUpperCase()}`;
      const { id } = await createListing({
        refNo,
        title:          item.title,
        description:    `Sahibinden.com'dan içe aktarıldı. Orijinal ilan: ${item.url ?? ""}`,
        city:           item.city,
        district:       item.district,
        neighborhood:   item.neighborhood,
        propertyType:   "konut",
        listingType:    "satilik",
        price:          item.price.toString(),
        rooms:          item.rooms,
        sqm:            item.sqm,
        status:         "beklemede",
        images:         item.imageUrl ? [item.imageUrl] : [],
        externalId:     item.externalId,
        externalSource: "sahibinden",
      });
      results.push(id);
    } catch (err) {
      errors.push(`${item.externalId}: ${err instanceof Error ? err.message : "Hata"}`);
    }
  }

  return NextResponse.json({
    imported: results.length,
    errors:   errors.length,
    errorList: errors.slice(0, 10),
    dupes,
  });
}
