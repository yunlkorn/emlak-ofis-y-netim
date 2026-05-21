import { NextRequest, NextResponse } from "next/server";
import { getLeadById, getInteractions } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI özet özelliği için ANTHROPIC_API_KEY gerekli. .env.local dosyasına ekleyin." },
      { status: 503 }
    );
  }

  try {
    const [lead, interactions] = await Promise.all([getLeadById(id), getInteractions(id)]);
    if (!lead) return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });

    const interactionText = interactions
      .map((i) => `[${new Date(i.createdAt).toLocaleDateString("tr-TR")} - ${i.channel} - ${i.direction}] ${i.content ?? "(içerik yok)"}`)
      .join("\n");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Aşağıdaki emlak müşterisinin bilgilerine ve iletişim geçmişine bakarak 3 cümlelik Türkçe özet yaz. Müşteri ihtiyaçları, ilgi düzeyi ve önerilen sonraki aksiyon üzerine yoğunlaş.

Müşteri: ${lead.fullName}
Bütçe: ${lead.budgetMax ? `${parseInt(lead.budgetMax).toLocaleString("tr-TR")} ₺` : "Belirtilmemiş"}
İlçe: ${lead.district ?? "Belirtilmemiş"}
Aşama: ${lead.stage}

İletişim geçmişi:
${interactionText || "Henüz etkileşim yok."}`,
      }],
    });

    const summary = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "AI servisi şu an kullanılamıyor." }, { status: 500 });
  }
}
