import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/schema";

const schema = z.object({
  name:        z.string().min(1).max(200),
  city:        z.string().min(1).max(100),
  plan:        z.enum(["baslangic", "takim", "kurumsal"]),
  ownerUserId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const result = schema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  const { name, city, plan, ownerUserId } = result.data;
  const limits = PLAN_LIMITS[plan];

  const { error } = await getDb().from("tenants").insert({
    name,
    city,
    plan,
    owner_user_id: ownerUserId,
    max_brokers: limits.maxBrokers === Infinity ? 9999 : limits.maxBrokers,
    max_leads_per_month: limits.maxLeadsPerMonth,
  });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ ok: true, warning: "tenants table not yet created" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
