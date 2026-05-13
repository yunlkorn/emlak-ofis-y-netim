import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadById, updateLead } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const patchSchema = z.object({
  status: z.enum(["yeni", "aranildi", "gorusme", "teklif", "kapandi", "kaybedildi"]).optional(),
  assignedBrokerId: z.string().nullable().optional(),
  nextFollowUpAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Broker sadece kendine atanmış lead'i güncelleyebilir; admin hepsini
  if (caller.broker.role !== "admin" && lead.assignedBrokerId !== caller.user.id) {
    return NextResponse.json({ error: "Bu lead'i güncelleme yetkiniz yok" }, { status: 403 });
  }

  const result = patchSchema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  await updateLead(id, result.data);
  return NextResponse.json({ ok: true });
}
