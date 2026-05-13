import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createListing } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const schema = z.object({
  refNo: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  city: z.string().min(1), district: z.string().min(1), neighborhood: z.string().optional(),
  addressFull: z.string().optional(),
  propertyType: z.enum(["konut", "isyeri", "arsa", "daire", "villa", "mustakil"]),
  listingType: z.enum(["satilik", "kiralik"]),
  price: z.string(), currency: z.string().default("TRY"),
  sqm: z.number().optional(), sqmNet: z.number().optional(), rooms: z.string().optional(),
  floor: z.string().optional(), totalFloors: z.number().optional(), buildingAge: z.number().optional(),
  heating: z.string().optional(), parking: z.boolean().optional(), furnished: z.boolean().optional(),
  status: z.enum(["aktif", "satildi", "kiralandi", "beklemede"]).default("aktif"),
  isFeatured: z.boolean().default(false), images: z.array(z.string()).default([]),
  videoUrl: z.string().optional(), brokerUserId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireBrokerRole().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  const result = await createListing(data);
  return NextResponse.json(result, { status: 201 });
}
