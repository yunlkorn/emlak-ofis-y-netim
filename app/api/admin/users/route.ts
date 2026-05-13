import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireBrokerRole } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().min(10).max(20),
  password: z.string().min(8).max(72),
  role: z.enum(["admin", "broker", "stajyer"]).default("broker"),
  officeName: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const caller = await requireBrokerRole(["admin"]).catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = schema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  const data = result.data;

  const sb = createAdminClient();

  // Supabase Auth'ta kullanıcı oluştur
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (authError) {
    const msg = authError.message.includes("already registered")
      ? "Bu e-posta adresi zaten kayıtlı."
      : authError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = authData.user.id;

  // brokers tablosuna ekle
  const { error: dbError } = await sb.from("brokers").insert({
    user_id: userId,
    full_name: data.fullName,
    phone: data.phone,
    email: data.email,
    role: data.role,
    is_active: true,
    office_name: data.officeName ?? null,
  });

  if (dbError) {
    await sb.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Kullanıcı oluşturulamadı." }, { status: 500 });
  }

  return NextResponse.json({ id: userId }, { status: 201 });
}
