import { NextRequest, NextResponse } from "next/server";
import { getListingById, incrementViewCount } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  incrementViewCount(id, listing.viewCount ?? 0).catch(() => {});
  return NextResponse.json(listing);
}
