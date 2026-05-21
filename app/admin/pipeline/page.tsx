import { getLeadsByStage, getBrokers } from "@/lib/db";
import { STAGE_LABELS, STAGE_ORDER, type Lead, type LeadStage } from "@/lib/schema";
import KanbanBoard from "./KanbanBoard";

export const metadata = { title: "Pipeline — Admin" };
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [leadsByStage, brokers] = await Promise.all([
    getLeadsByStage(),
    getBrokers(true),
  ]);

  const brokerMap = Object.fromEntries(brokers.map((b) => [b.userId, b.fullName]));

  // Sadece pipeline stage'leri (kapandi/kaybedildi hariç)
  const pipelineStages: LeadStage[] = ["yeni","iletisime_gecildi","gorusme","teklif","sozlesme"];

  const columns = pipelineStages.map((stage) => {
    const leads = (leadsByStage[stage] ?? []) as Lead[];
    const totalBudget = leads.reduce((s, l) => s + (parseFloat(l.budgetMax ?? "0") || 0), 0);
    return { stage, label: STAGE_LABELS[stage], leads, totalBudget };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Pipeline
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
            Sürükle &amp; bırak ile lead&apos;leri aşamalar arasında taşı
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: "var(--c-warning)" }} />
            7+ gün hareketsiz
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: "var(--c-danger)" }} />
            14+ gün hareketsiz
          </span>
        </div>
      </div>

      <KanbanBoard columns={columns} brokerMap={brokerMap} />
    </div>
  );
}
