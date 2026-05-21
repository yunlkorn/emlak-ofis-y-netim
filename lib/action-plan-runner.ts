/**
 * Action Plan Runner
 * Çalışma zamanı: Vercel cron veya manuel tetikleme.
 * Her gün bugün çalışması gereken action log adımlarını işler.
 */
import { getDb, createActionLog } from "./db";
import { sendWhatsApp } from "./whatsapp";

interface PlanStep {
  day: number;
  type: "whatsapp" | "arama" | "email" | "gorev";
  template: string;
  assignTo: "sorumlu_broker" | "ofis_yoneticisi";
}

interface ActionLogRow {
  id: string;
  lead_id: string;
  plan_id: string;
  step_index: number;
  scheduled_for: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leads: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_plans: any;
}

/** Şablondaki {{değişken}} yerleşimlerini doldur */
function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

/** Broker'ın hareketi var mı son N günde */
async function brokerActedRecently(leadId: string, brokerId: string, daysSince: number): Promise<boolean> {
  const since = new Date(Date.now() - daysSince * 86_400_000).toISOString();
  const { data } = await getDb()
    .from("lead_interactions")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId)
    .eq("created_by_user_id", brokerId)
    .gte("created_at", since);
  return (data as unknown as number | null) !== null && (data as unknown as number) > 0;
}

export async function runActionPlans(): Promise<{ processed: number; errors: number }> {
  const db = getDb();
  let processed = 0;
  let errors    = 0;

  // Bugün çalışması gereken pending logları al
  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);

  const { data: logs, error } = await db
    .from("lead_action_logs")
    .select("*, leads(*), action_plans(*)")
    .eq("result", "pending")
    .gte("scheduled_for", start.toISOString())
    .lte("scheduled_for", end.toISOString());

  if (error || !logs) return { processed, errors };

  for (const log of logs as ActionLogRow[]) {
    try {
      const lead    = log.leads;
      const plan    = log.action_plans;
      const steps   = (plan?.steps ?? []) as PlanStep[];
      const step    = steps[log.step_index];
      if (!step) continue;

      const brokerPhone = lead?.assigned_broker_id
        ? (await db.from("brokers").select("phone").eq("user_id", lead.assigned_broker_id).single()).data?.phone
        : null;
      const adminPhone = process.env.BROKER_WHATSAPP;

      const vars: Record<string, string> = {
        ad:       lead?.full_name ?? "Müşteri",
        ilce:     lead?.district  ?? "",
        ofis_adi: process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi",
        ofis_tel: process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "",
        butce:    lead?.budget_max ? parseInt(lead.budget_max).toLocaleString("tr-TR") + " ₺" : "",
      };

      const message = fillTemplate(step.template, vars);
      let result: "sent" | "failed" | "skipped" = "skipped";

      if (step.type === "whatsapp") {
        const target = step.assignTo === "ofis_yoneticisi" ? adminPhone : brokerPhone;
        if (target) {
          await sendWhatsApp(target, message);
          result = "sent";
        }
      } else if (step.type === "gorev") {
        // Broker hareketi yoksa yöneticiye uyarı gönder
        const hadActivity = lead?.assigned_broker_id
          ? await brokerActedRecently(log.lead_id, lead.assigned_broker_id, 7)
          : false;
        if (!hadActivity && adminPhone) {
          await sendWhatsApp(adminPhone, `⚠️ Hareketsiz Lead:\n${lead?.full_name}\n7 gündür broker aksiyonu yok.\n/admin/leads/${log.lead_id}`);
          result = "sent";
        } else {
          result = "skipped";
        }
      } else if (step.type === "arama") {
        // Arama görevi oluştur — şimdilik sadece işaretle
        result = "sent";
      }

      // Bu adımı tamamlandı işaretle
      await db.from("lead_action_logs").update({
        executed_at: new Date().toISOString(),
        result,
        notes: message.slice(0, 200),
      }).eq("id", log.id);

      // Bir sonraki adım var mı ve planlanmalı mı?
      const nextStep = steps[log.step_index + 1];
      if (nextStep) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (nextStep.day - step.day));
        await createActionLog({
          leadId:       log.lead_id,
          planId:       log.plan_id,
          stepIndex:    log.step_index + 1,
          scheduledFor: nextDate.toISOString(),
        });
      }

      processed++;
    } catch (err) {
      console.error("Action plan step error:", err);
      errors++;
    }
  }

  return { processed, errors };
}
