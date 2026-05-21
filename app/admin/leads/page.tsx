import { getLeads, getBrokers } from "@/lib/db";
import Link from "next/link";
import { STAGE_LABELS, SOURCE_LABELS, type LeadStage, type LeadSource } from "@/lib/schema";
import { Filter, Clock, Star, CheckCircle, XCircle } from "lucide-react";
import NewLeadModal from "./NewLeadModal";

export const metadata = { title: "Lead'ler — Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    stage?: string;
    source?: string;
    broker?: string;
    smartList?: string;
  }>;
}

const SMART_LISTS = [
  { key: "bugun_takip",    label: "Bugün Takip",        icon: Clock,       color: "var(--c-info)" },
  { key: "sessiz_7",       label: "7 Gün Sessiz",       icon: Clock,       color: "var(--c-warning)" },
  { key: "yuksek_skor",    label: "Yüksek Skor (Yeni)", icon: Star,        color: "var(--c-success)" },
  { key: "bu_hafta_kapandi",label: "Bu Hafta Kapandı",  icon: CheckCircle, color: "var(--c-success)" },
  { key: "kaybedilen_30",  label: "30 Gün Kayıp",       icon: XCircle,     color: "var(--c-danger)" },
];

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  yeni:              { bg: "var(--stage-yeni-bg)",        text: "var(--stage-yeni)" },
  iletisime_gecildi: { bg: "var(--stage-iletisime-bg)",   text: "var(--stage-iletisime)" },
  gorusme:           { bg: "var(--stage-gorusme-bg)",     text: "var(--stage-gorusme)" },
  teklif:            { bg: "var(--stage-teklif-bg)",      text: "var(--stage-teklif)" },
  sozlesme:          { bg: "var(--stage-sozlesme-bg)",    text: "var(--stage-sozlesme)" },
  kapandi:           { bg: "var(--stage-kapandi-bg)",     text: "var(--stage-kapandi)" },
  kaybedildi:        { bg: "var(--stage-kaybedildi-bg)",  text: "var(--stage-kaybedildi)" },
};

function buildUrl(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  return `/admin/leads?${params.toString()}`;
}

export default async function AdminLeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [list, brokers] = await Promise.all([
    getLeads({ stage: sp.stage, source: sp.source, brokerId: sp.broker, smartList: sp.smartList }),
    getBrokers(true),
  ]);
  const brokerMap = Object.fromEntries(brokers.map((b) => [b.userId, b.fullName]));

  const isFiltered = sp.stage || sp.source || sp.broker || sp.smartList;
  const baseParams = { stage: sp.stage, source: sp.source, broker: sp.broker };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 space-y-6 fade-up">
        {/* Smart Lists */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
            style={{ color: "var(--c-text-subtle)", fontFamily: "var(--font-display)" }}>
            Akıllı Listeler
          </p>
          <div className="space-y-0.5">
            {SMART_LISTS.map(({ key, label, icon: Icon, color }) => (
              <Link
                key={key}
                href={buildUrl({}, { smartList: key })}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: sp.smartList === key ? `${color}18` : "transparent",
                  color: sp.smartList === key ? color : "var(--c-text-2)",
                  fontWeight: sp.smartList === key ? "600" : "500",
                }}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stage filtresi */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
            style={{ color: "var(--c-text-subtle)", fontFamily: "var(--font-display)" }}>
            Aşama
          </p>
          <div className="space-y-0.5">
            <Link
              href={buildUrl(baseParams, { stage: undefined, smartList: undefined })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: !sp.stage && !sp.smartList ? "var(--c-brand-light)" : "transparent",
                color: !sp.stage && !sp.smartList ? "var(--c-brand)" : "var(--c-text-2)",
                fontWeight: !sp.stage && !sp.smartList ? "600" : "500",
              }}
            >
              Tümü
            </Link>
            {(Object.keys(STAGE_LABELS) as LeadStage[]).map((s) => {
              const colors = STAGE_COLORS[s];
              return (
                <Link
                  key={s}
                  href={buildUrl(baseParams, { stage: s, smartList: undefined })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    background: sp.stage === s ? colors.bg : "transparent",
                    color: sp.stage === s ? colors.text : "var(--c-text-2)",
                    fontWeight: sp.stage === s ? "600" : "500",
                  }}
                >
                  {STAGE_LABELS[s]}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Kaynak filtresi */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
            style={{ color: "var(--c-text-subtle)", fontFamily: "var(--font-display)" }}>
            Kaynak
          </p>
          <div className="space-y-0.5">
            {(Object.entries(SOURCE_LABELS) as [LeadSource, string][]).map(([key, label]) => (
              <Link
                key={key}
                href={buildUrl(baseParams, { source: key, smartList: undefined })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: sp.source === key ? "var(--c-brand-light)" : "transparent",
                  color: sp.source === key ? "var(--c-brand)" : "var(--c-text-muted)",
                  fontWeight: sp.source === key ? "600" : "400",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between fade-up">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {sp.smartList
                ? SMART_LISTS.find((s) => s.key === sp.smartList)?.label
                : sp.stage
                ? STAGE_LABELS[sp.stage as LeadStage]
                : "Lead'ler"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
              {list.length} lead{isFiltered ? " · filtrelendi" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFiltered && (
              <Link href="/admin/leads" className="admin-btn admin-btn-ghost text-xs">
                Filtreyi Temizle
              </Link>
            )}
            <NewLeadModal />
          </div>
        </div>

        {/* Table */}
        <div className="admin-card overflow-x-auto fade-up fade-up-1">
          <table className="data-table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                {["Ad Soyad", "İletişim", "İlçe", "Bütçe", "Skor", "Kaynak", "Aşama", "Danışman", "Tarih"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((l) => {
                const stageColors = STAGE_COLORS[l.stage ?? "yeni"] ?? STAGE_COLORS["yeni"];
                const scoreClass  = (l.score ?? 0) >= 71 ? "score-high" : (l.score ?? 0) >= 41 ? "score-mid" : "score-low";
                const lastContact = l.lastContactedAt
                  ? Math.floor((Date.now() - new Date(l.lastContactedAt).getTime()) / 86_400_000)
                  : null;
                return (
                  <tr key={l.id}>
                    <td>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-semibold hover:underline"
                        style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}
                      >
                        {l.fullName}
                      </Link>
                      {lastContact !== null && lastContact >= 7 && (
                        <span className="ml-2 text-xs" style={{ color: lastContact >= 14 ? "var(--c-danger)" : "var(--c-warning)" }}>
                          {lastContact}g sessiz
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ color: "var(--c-text-2)" }}>{l.phone}</div>
                      {l.email && <div className="text-xs" style={{ color: "var(--c-text-subtle)" }}>{l.email}</div>}
                    </td>
                    <td style={{ color: "var(--c-text-muted)" }}>{l.district ?? "—"}</td>
                    <td>
                      {l.budgetMax ? (
                        <span className="font-semibold text-xs" style={{ color: "var(--c-text-2)" }}>
                          {parseInt(l.budgetMax).toLocaleString("tr-TR")} ₺
                        </span>
                      ) : <span style={{ color: "var(--c-text-subtle)" }}>—</span>}
                    </td>
                    <td>
                      <span className={`stage-badge ${scoreClass}`}>{l.score ?? 0}</span>
                    </td>
                    <td style={{ color: "var(--c-text-muted)", fontSize: "12px" }}>
                      {SOURCE_LABELS[l.source as LeadSource] ?? l.source}
                    </td>
                    <td>
                      <span
                        className="stage-badge"
                        style={{ background: stageColors.bg, color: stageColors.text }}
                      >
                        {STAGE_LABELS[l.stage as LeadStage] ?? l.stage}
                      </span>
                    </td>
                    <td style={{ color: "var(--c-text-muted)", fontSize: "12px" }}>
                      {l.assignedBrokerId ? (brokerMap[l.assignedBrokerId] ?? "—") : "—"}
                    </td>
                    <td style={{ color: "var(--c-text-subtle)", fontSize: "12px" }}>
                      {new Date(l.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!list.length && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Filter size={28} style={{ color: "var(--c-text-subtle)" }} />
              <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                Bu filtre için lead bulunamadı.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
