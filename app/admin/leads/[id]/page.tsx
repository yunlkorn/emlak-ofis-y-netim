import { getLeadById, getInteractions, getBrokers } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageCircle, Zap } from "lucide-react";
import { STAGE_LABELS, SOURCE_LABELS, type LeadStage, type LeadSource } from "@/lib/schema";
import LeadStageForm from "./LeadStageForm";
import AddInteractionForm from "./AddInteractionForm";
import AISummaryButton from "./AISummaryButton";
import DeleteLeadButton from "./DeleteLeadButton";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  yeni:              { bg: "var(--stage-yeni-bg)",        text: "var(--stage-yeni)" },
  iletisime_gecildi: { bg: "var(--stage-iletisime-bg)",   text: "var(--stage-iletisime)" },
  gorusme:           { bg: "var(--stage-gorusme-bg)",     text: "var(--stage-gorusme)" },
  teklif:            { bg: "var(--stage-teklif-bg)",      text: "var(--stage-teklif)" },
  sozlesme:          { bg: "var(--stage-sozlesme-bg)",    text: "var(--stage-sozlesme)" },
  kapandi:           { bg: "var(--stage-kapandi-bg)",     text: "var(--stage-kapandi)" },
  kaybedildi:        { bg: "var(--stage-kaybedildi-bg)",  text: "var(--stage-kaybedildi)" },
};

const INTERACTION_ICONS: Record<string, string> = {
  telefon: "📞", whatsapp: "💬", sms: "✉️", email: "📧", yuzyuze: "🤝", not: "📝",
};

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 71 ? "score-high" : score >= 41 ? "score-mid" : "score-low";
  const label = score >= 71 ? "Yüksek" : score >= 41 ? "Orta" : "Düşük";
  return (
    <span className={`stage-badge ${cls} text-xs`}>
      {score}/100 · {label}
    </span>
  );
}

export default async function LeadDetailPage({ params }: Props) {
  const [{ id }, role] = await Promise.all([params, getSessionRole()]);
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const [interactions, brokerList] = await Promise.all([
    getInteractions(id),
    getBrokers(true),
  ]);

  const canEdit     = role === "admin" || role === "broker";
  const stageColors = STAGE_COLORS[lead.stage ?? "yeni"] ?? STAGE_COLORS["yeni"];
  const brokerMap   = Object.fromEntries(brokerList.map((b) => [b.userId, b.fullName]));
  const waLink      = `https://wa.me/${lead.phone.replace(/\D/g,"")}`
    + `?text=${encodeURIComponent(`Merhaba ${lead.fullName}, ${process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi"} olarak sizi arıyoruz.`)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 fade-up">
        <Link
          href="/admin/leads"
          className="mt-1 p-2 rounded-xl transition-colors admin-btn-ghost"
          style={{ border: "1px solid var(--c-border)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {lead.fullName}
            </h1>
            <span className="stage-badge" style={{ background: stageColors.bg, color: stageColors.text }}>
              {STAGE_LABELS[lead.stage as LeadStage] ?? lead.stage}
            </span>
            <ScoreBadge score={lead.score ?? 0} />
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--c-text-muted)" }}>
            {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}
            {" · "}
            {new Date(lead.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })}
          </p>
        </div>

        {/* Sil */}
        {role === "admin" && <DeleteLeadButton leadId={id} />}

        {/* Hızlı iletişim butonları */}
        <div className="flex items-center gap-2">
          <a href={`tel:${lead.phone}`} className="admin-btn admin-btn-ghost" title="Ara">
            <Phone size={14} />
            Ara
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: "#25d366", color: "white", boxShadow: "0 4px 12px rgba(37,211,102,0.30)" }}
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol — bilgiler */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lead bilgileri */}
          <div className="admin-card p-5 fade-up fade-up-1">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--c-text-subtle)" }}>
              Lead Bilgileri
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                ["Telefon", lead.phone],
                ["E-posta", lead.email ?? "—"],
                ["İlan Tipi", lead.listingType ?? "—"],
                ["Mülk Tipi", lead.propertyType ?? "—"],
                ["İlçe", lead.district ?? "—"],
                ["Şehir", lead.city ?? "—"],
                ["Min Bütçe", lead.budgetMin ? `${parseInt(lead.budgetMin).toLocaleString("tr-TR")} ₺` : "—"],
                ["Max Bütçe", lead.budgetMax ? `${parseInt(lead.budgetMax).toLocaleString("tr-TR")} ₺` : "—"],
                ["Oda Tercihi", lead.roomsPreference ?? "—"],
                ["Atanan Danışman", lead.assignedBrokerId ? (brokerMap[lead.assignedBrokerId] ?? "—") : "—"],
                ["Atanma Tarihi", lead.assignedAt ? new Date(lead.assignedAt).toLocaleString("tr-TR") : "—"],
                ["Son İletişim", lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString("tr-TR") : "—"],
                ["Aşamada Süre", `${lead.daysInStage ?? 0} gün`],
                ["Sonraki Takip", lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString("tr-TR") : "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-xs font-medium mb-0.5" style={{ color: "var(--c-text-subtle)" }}>{k}</dt>
                  <dd className="font-medium" style={{ color: "var(--c-text)" }}>{v}</dd>
                </div>
              ))}
            </dl>
            {lead.notes && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "var(--c-surface-2)", color: "var(--c-text-2)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--c-text-subtle)" }}>Notlar</p>
                {lead.notes}
              </div>
            )}
          </div>

          {/* Aktivite akışı */}
          <div className="admin-card p-5 fade-up fade-up-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)", color: "var(--c-text-subtle)" }}>
                İletişim Geçmişi
              </h2>
              <AISummaryButton leadId={id} interactionCount={interactions.length} />
            </div>

            {interactions.length > 0 ? (
              <ol className="space-y-3">
                {interactions.map((i, idx) => (
                  <li key={i.id} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ background: "var(--c-surface-2)", border: "2px solid var(--c-border)" }}
                    >
                      {INTERACTION_ICONS[i.channel] ?? "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold capitalize" style={{ color: "var(--c-text-2)" }}>
                          {i.channel}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: i.direction === "gelen" ? "var(--c-info-bg)" : "var(--c-surface-2)",
                            color: i.direction === "gelen" ? "var(--c-info)" : "var(--c-text-muted)",
                          }}>
                          {i.direction}
                        </span>
                        <span className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
                          {new Date(i.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>
                      {i.content && (
                        <p className="text-sm mt-1" style={{ color: "var(--c-text-2)" }}>{i.content}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm py-4" style={{ color: "var(--c-text-muted)" }}>Henüz etkileşim yok.</p>
            )}

            {canEdit && <AddInteractionForm leadId={id} />}
          </div>
        </div>

        {/* Sağ — aksiyonlar */}
        <div className="space-y-4">
          <LeadStageForm lead={lead} brokers={brokerList} canEdit={canEdit} />

          {/* Hızlı aksiyon butonları */}
          <div className="admin-card p-4 space-y-2 fade-up fade-up-3">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--c-text-subtle)" }}>
              Hızlı Aksiyonlar
            </h2>
            <a href={`tel:${lead.phone}`}
              className="admin-btn admin-btn-ghost w-full justify-center text-xs"
              style={{ textAlign: "center" }}>
              <Phone size={13} /> Telefon Aç
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="admin-btn w-full justify-center text-xs"
              style={{ background: "#25d366", color: "white", textAlign: "center" }}>
              <MessageCircle size={13} /> WhatsApp Gönder
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="admin-btn admin-btn-ghost w-full justify-center text-xs"
                style={{ textAlign: "center" }}>
                <Mail size={13} /> E-posta Gönder
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
