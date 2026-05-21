import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadById, updateLead, getDb } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";

const patchSchema = z.object({
  stage:            z.enum(["yeni","iletisime_gecildi","gorusme","teklif","sozlesme","kapandi","kaybedildi"]).optional(),
  assignedBrokerId: z.string().nullable().optional(),
  assignedAt:       z.string().nullable().optional(),
  nextFollowUpAt:   z.string().nullable().optional(),
  lastContactedAt:  z.string().nullable().optional(),
  notes:            z.string().max(2000).optional(),
  score:            z.number().int().min(0).max(100).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (caller.broker.role !== "admin" && lead.assignedBrokerId !== caller.user.id) {
    return NextResponse.json({ error: "Bu lead'i güncelleme yetkiniz yok" }, { status: 403 });
  }

  const result = patchSchema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  await updateLead(id, result.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole().catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.broker.role !== "admin") {
    return NextResponse.json({ error: "Silme işlemi sadece adminlere açıktır" }, { status: 403 });
  }

  const { id } = await params;
  const { error } = await getDb().from("leads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
