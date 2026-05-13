import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireBrokerRole } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(["admin", "broker", "stajyer"]).optional(),
  isActive: z.boolean().optional(),
  officeName: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole(["admin"]).catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = schema.parse(await req.json());

  const sb = createAdminClient();
  const update: Record<string, unknown> = {};
  if (data.fullName !== undefined) update.full_name = data.fullName;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.role !== undefined) update.role = data.role;
  if (data.isActive !== undefined) update.is_active = data.isActive;
  if (data.officeName !== undefined) update.office_name = data.officeName;

  const { error } = await sb.from("brokers").update(update).eq("user_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireBrokerRole(["admin"]).catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Kendini silemez
  if (id === caller.user.id) {
    return NextResponse.json({ error: "Kendinizi silemezsiniz" }, { status: 400 });
  }

  const sb = createAdminClient();
  await sb.from("brokers").delete().eq("user_id", id);
  await sb.auth.admin.deleteUser(id);

  return NextResponse.json({ ok: true });
}
