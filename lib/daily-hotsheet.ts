/**
 * Daily Hotsheet — Her sabah 08:30'da her broker'a WhatsApp özet gönderir.
 * Tetikleyici: Vercel Cron (vercel.json)
 */
import { getDb } from "./db";
import { sendWhatsApp } from "./whatsapp";

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toLocaleString("tr-TR")} ₺`;
}

export async function sendDailyHotsheets(): Promise<{ sent: number; errors: number }> {
  const db    = getDb();
  let sent    = 0;
  let errors  = 0;

  const today     = new Date();
  const todayStr  = today.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
  const dayStart  = new Date(today); dayStart.setHours(0,0,0,0);
  const dayEnd    = new Date(today); dayEnd.setHours(23,59,59,999);
  const yesterday = new Date(today.getTime() - 86_400_000);

  const { data: brokers } = await db.from("brokers").select("*").eq("is_active", true);
  if (!brokers) return { sent, errors };

  for (const broker of brokers) {
    try {
      const brokerId = broker.user_id;

      // Bugün takip edilecekler
      const { count: todayFollowups } = await db
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("assigned_broker_id", brokerId)
        .gte("next_follow_up_at", dayStart.toISOString())
        .lte("next_follow_up_at", dayEnd.toISOString());

      // Bekleyen görevler (pending action logs)
      const { count: pendingTasks } = await db
        .from("lead_action_logs")
        .select("id", { count: "exact", head: true })
        .eq("result", "pending")
        .lte("scheduled_for", dayEnd.toISOString())
        .in("lead_id",
          (await db.from("leads").select("id").eq("assigned_broker_id", brokerId)).data?.map((l: { id: string }) => l.id) ?? []
        );

      // Dünden bu yana yeni leadler
      const { data: newLeads } = await db
        .from("leads")
        .select("id,full_name,district,budget_max,score")
        .eq("assigned_broker_id", brokerId)
        .gte("assigned_at", yesterday.toISOString())
        .order("score", { ascending: false });

      // En yüksek skorlu 3 aktif lead
      const { data: topLeads } = await db
        .from("leads")
        .select("id,full_name,district,budget_max,score")
        .eq("assigned_broker_id", brokerId)
        .not("stage", "in", '("kapandi","kaybedildi")')
        .order("score", { ascending: false })
        .limit(3);

      const lines: string[] = [
        `🌅 *Günaydın, ${broker.full_name}!*`,
        `📅 ${todayStr}`,
        ``,
        `📋 *Bugünün Özeti*`,
        `• Takip edilecek: ${todayFollowups ?? 0} lead`,
        `• Bekleyen görev: ${pendingTasks ?? 0}`,
        `• Dün atanan yeni: ${newLeads?.length ?? 0} lead`,
        ``,
      ];

      if (topLeads && topLeads.length > 0) {
        lines.push(`🔥 *En Yüksek Skorlu Lead'ler*`);
        for (const l of topLeads) {
          const budget = l.budget_max ? formatTL(parseFloat(l.budget_max)) : "—";
          lines.push(`• ${l.full_name} — ${l.district ?? "?"} — ${budget} (${l.score}/100)`);
        }
        lines.push(``);
      }

      lines.push(`🔗 ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/leads`);

      await sendWhatsApp(broker.phone, lines.join("\n"));
      sent++;
    } catch (err) {
      console.error(`Hotsheet error for broker ${broker.user_id}:`, err);
      errors++;
    }
  }

  return { sent, errors };
}
