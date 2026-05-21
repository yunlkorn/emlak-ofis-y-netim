import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLead, findAvailableBroker, incrementBrokerLeadCount, getDefaultActionPlan, createActionLog } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  fullName:        z.string().min(2).max(100),
  phone:           z.string().min(7).max(20),
  email:           z.string().email().max(200).optional().or(z.literal("").transform(() => undefined)),
  notes:           z.string().max(1000).optional(),
  sourceListingId: z.string().uuid().optional(),
  source:          z.enum(["sahibinden","hurriyetemlak","zingat","facebook_ads","instagram","tavsiye","direkt","diger"]).default("direkt"),
  listingType:     z.enum(["satilik","kiralik"]).optional(),
  propertyType:    z.string().max(50).optional(),
  district:        z.string().max(100).optional(),
  city:            z.string().max(100).optional(),
  budgetMin:       z.number().positive().optional(),
  budgetMax:       z.number().positive().optional(),
  roomsPreference: z.string().max(20).optional(),
});

/** Basit AI skoru: bütçe, telefon, kaynak kalitesi */
function calcScore(data: z.infer<typeof schema>): number {
  let score = 0;
  // Bütçe varlığı
  if (data.budgetMax) {
    score += 30;
    if (data.budgetMax > 5_000_000) score += 10;
    if (data.budgetMax > 10_000_000) score += 10;
  }
  // Telefon uzunluğu (kısa = spam riski)
  if (data.phone.replace(/\D/g,"").length >= 10) score += 15;
  // Kaynak kalitesi
  const sourceScores: Record<string, number> = {
    tavsiye: 25, hurriyetemlak: 20, sahibinden: 15, zingat: 15,
    facebook_ads: 10, instagram: 8, direkt: 20, diger: 5,
  };
  score += sourceScores[data.source] ?? 5;
  // E-posta var mı
  if (data.email) score += 5;
  // İlçe var mı
  if (data.district) score += 5;
  return Math.min(100, score);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  if (!checkRateLimit(`lead:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);
    const phone = normalizePhone(data.phone);
    const score = calcScore(data);

    // 1. Uygun broker'ı bul (Speed to Lead)
    const broker = await findAvailableBroker(data.budgetMax);
    const now    = new Date().toISOString();

    // 2. Lead oluştur
    const lead = await createLead({
      ...data,
      phone,
      budgetMin: data.budgetMin?.toString(),
      budgetMax: data.budgetMax?.toString(),
      score,
      assignedBrokerId: broker?.userId,
      assignedAt: broker ? now : undefined,
    });

    // 3. Broker sayacını artır + WhatsApp bildirimi (fire & forget)
    if (broker) {
      incrementBrokerLeadCount(broker.userId).catch(() => {});

      const message = [
        `🔥 *Yeni Lead* — Skor: ${score}/100`,
        `👤 ${data.fullName}`,
        `📱 ${phone}`,
        data.district ? `📍 ${data.district}` : null,
        data.budgetMax ? `💰 ${parseInt(data.budgetMax.toString()).toLocaleString("tr-TR")} ₺` : null,
        `🏷️ Kaynak: ${data.source}`,
        `\n🔗 /admin/leads/${lead.id}`,
      ].filter(Boolean).join("\n");

      sendWhatsApp(broker.phone, message).catch(() => {});
    }

    // 4. Varsayılan action plan'ı başlat
    const plan = await getDefaultActionPlan().catch(() => null);
    if (plan?.steps?.length) {
      createActionLog({
        leadId:       lead.id,
        planId:       plan.id,
        stepIndex:    0,
        scheduledFor: now,
      }).catch(() => {});
    }

    // 5. Legacy n8n webhook (backward compat)
    const webhookUrl = process.env.N8N_WEBHOOK_LEAD;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, score, brokerId: broker?.userId, ...data }),
      }).catch(() => {});
    }

    return NextResponse.json({ id: lead.id, score, assignedTo: broker?.fullName }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 422 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
