import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().max(200).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().max(1000).optional(),
  sourceListingId: z.string().uuid().optional(),
  source: z.enum(["form", "whatsapp", "instagram", "telefon", "referans", "ilan"]).default("form"),
  listingType: z.enum(["satilik", "kiralik"]).optional(),
  propertyType: z.string().max(50).optional(),
  district: z.string().max(100).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  roomsPreference: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  // IP başına saatte 5 lead
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(`lead:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);
    const lead = await createLead({
      ...data,
      phone: normalizePhone(data.phone),
      budgetMin: data.budgetMin?.toString(),
      budgetMax: data.budgetMax?.toString(),
    });

    const webhookUrl = process.env.N8N_WEBHOOK_LEAD;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, ...data }),
      }).catch(() => {});
    }

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 422 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
