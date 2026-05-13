import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("sayfa") ?? "1"));
  const limit = Math.min(50, parseInt(sp.get("limit") ?? "12"));
  const results = await getListings({
    status: "aktif",
    listingType: sp.get("tip") ?? undefined,
    propertyType: sp.get("tur") ?? undefined,
    district: sp.get("ilce") ?? undefined,
    minPrice: sp.get("minFiyat") ?? undefined,
    maxPrice: sp.get("maxFiyat") ?? undefined,
    limit,
    offset: (page - 1) * limit,
  });
  return NextResponse.json(results);
}
