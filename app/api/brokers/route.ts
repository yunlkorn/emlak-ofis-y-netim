import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBrokerRole } from "@/lib/auth";
import { getDb, getTenantByOwner, getTenantBrokerCount } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/schema";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  fullName: z.string().min(1).max(200),
  email:    z.string().email(),
  phone:    z.string().min(1).max(30),
  password: z.string().min(6),
  role:     z.enum(["admin", "broker", "stajyer"]).default("broker"),
});

export async function GET() {
  const caller = await requireBrokerRole(["admin"]).catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.broker.role !== "admin") return NextResponse.json({ error: "Sadece admin erişebilir" }, { status: 403 });

  const { data, error } = await getDb().from("brokers").select("*").order("full_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const caller = await requireBrokerRole(["admin"]).catch(() => null);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.broker.role !== "admin") return NextResponse.json({ error: "Sadece admin erişebilir" }, { status: 403 });

  const result = schema.safeParse(await req.json());
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  // Plan limit kontrolü
  const tenant = await getTenantByOwner(caller.user.id);
  if (tenant) {
    const limits = PLAN_LIMITS[tenant.plan as string];
    if (limits) {
      const current = await getTenantBrokerCount(tenant.id);
      const max = limits.maxBrokers === Infinity ? 9999 : limits.maxBrokers;
      if (current >= max) {
        return NextResponse.json(
          {
            error: `${limits.label} paketinde en fazla ${max === 9999 ? "sınırsız" : max} danışman ekleyebilirsiniz. Planınızı yükseltmek için bizimle iletişime geçin.`,
            limitReached: true,
            current,
            max,
          },
          { status: 403 }
        );
      }
    }
  }

  const { fullName, email, phone, password, role } = result.data;

  // Supabase Auth'da kullanıcı oluştur
  const supabaseAdmin = createAdminClient();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // brokers tablosuna ekle
  const { error: brokerError } = await getDb().from("brokers").insert({
    user_id: userId,
    full_name: fullName,
    email,
    phone,
    role,
    is_active: true,
    ...(tenant ? { tenant_id: tenant.id } : {}),
  });

  if (brokerError) {
    // Auth user oluşturuldu ama broker kaydı başarısız — geri al
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: brokerError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId });
}
