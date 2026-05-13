import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadById, createInteraction } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const schema = z.object({
  channel: z.enum(["telefon", "whatsapp", "sms", "email", "yuzyuze", "not"]),
  direction: z.enum(["giden", "gelen"]),
  content: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (caller.broker.role !== "admin" && lead.assignedBrokerId !== caller.user.id) {
    return NextResponse.json({ error: "Bu lead'e etkileşim ekleme yetkiniz yok" }, { status: 403 });
  }

  const result = schema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  const interaction = await createInteraction({
    leadId: id,
    ...result.data,
    createdByUserId: caller.user.id,
  });
  return NextResponse.json({ id: interaction.id }, { status: 201 });
}
