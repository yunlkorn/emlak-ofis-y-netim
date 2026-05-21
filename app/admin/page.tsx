import { getStats, getLeads } from "@/lib/db";
import Link from "next/link";
import {
  Building2, Users, TrendingUp, Zap,
  ArrowRight, Kanban, BarChart3, Clock,
} from "lucide-react";
import { STAGE_LABELS, type LeadStage } from "@/lib/schema";

export const metadata = { title: "Dashboard — Admin" };
export const dynamic  = "force-dynamic";

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  yeni:              { bg: "var(--stage-yeni-bg)",        text: "var(--stage-yeni)" },
  iletisime_gecildi: { bg: "var(--stage-iletisime-bg)",   text: "var(--stage-iletisime)" },
  gorusme:           { bg: "var(--stage-gorusme-bg)",     text: "var(--stage-gorusme)" },
  teklif:            { bg: "var(--stage-teklif-bg)",      text: "var(--stage-teklif)" },
  sozlesme:          { bg: "var(--stage-sozlesme-bg)",    text: "var(--stage-sozlesme)" },
  kapandi:           { bg: "var(--stage-kapandi-bg)",     text: "var(--stage-kapandi)" },
  kaybedildi:        { bg: "var(--stage-kaybedildi-bg)",  text: "var(--stage-kaybedildi)" },
};

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toLocaleString("tr-TR")} ₺`;
}

export default async function AdminDashboard() {
  const [stats, recentLeads] = await Promise.all([
    getStats(),
    getLeads({ limit: 8 }),
  ]);

  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak CRM";

  const statCards = [
    { label: "Aktif İlan",     value: stats.activeListings,  total: stats.totalListings, icon: Building2, href: "/admin/ilanlar",  color: "var(--c-brand)" },
    { label: "Toplam Lead",    value: stats.totalLeads,      total: null,                 icon: Users,     href: "/admin/leads",    color: "var(--c-info)" },
    { label: "Bu Hafta Gelen", value: stats.newLeads,        total: null,                 icon: Zap,       href: "/admin/leads",    color: "var(--c-warning)" },
    { label: "Bu Ay Kapandı",  value: stats.closedThisMonth, total: null,                 icon: TrendingUp,href: "/admin/raporlar", color: "var(--c-success)" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="fade-up">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {officeName}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--c-text-muted)" }}>
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, total, icon: Icon, href, color }, i) => (
          <Link
            key={label}
            href={href}
            className="admin-card p-5 hover:shadow-md transition-shadow group fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)", color: "var(--c-text-subtle)" }}>
                {label}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
              {value}
            </p>
            {total !== null && (
              <p className="text-xs mt-1" style={{ color: "var(--c-text-subtle)" }}>
                / {total} toplam
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 fade-up fade-up-2">
        <Link href="/admin/pipeline"
          className="admin-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--c-brand-light)" }}>
            <Kanban size={18} style={{ color: "var(--c-brand)" }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Pipeline</p>
            <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>Kanban görünümü</p>
          </div>
          <ArrowRight size={16} style={{ color: "var(--c-text-subtle)" }}
            className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/admin/raporlar"
          className="admin-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--c-success-bg)" }}>
            <BarChart3 size={18} style={{ color: "var(--c-success)" }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Raporlar</p>
            <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>Danışman performansı</p>
          </div>
          <ArrowRight size={16} style={{ color: "var(--c-text-subtle)" }}
            className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Son leadler */}
      <div className="admin-card overflow-hidden fade-up fade-up-3">
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--c-border)" }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Son Lead&apos;ler
          </h2>
          <Link href="/admin/leads" className="admin-btn admin-btn-ghost text-xs">
            Tümünü Gör <ArrowRight size={12} />
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {["Ad Soyad", "Kaynak", "Bütçe", "Aşama", "Tarih"].map((h) => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((l) => {
              const stageColors = STAGE_COLORS[l.stage ?? "yeni"] ?? STAGE_COLORS["yeni"];
              return (
                <tr key={l.id}>
                  <td>
                    <Link href={`/admin/leads/${l.id}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
                      {l.fullName}
                    </Link>
                  </td>
                  <td className="text-xs" style={{ color: "var(--c-text-muted)" }}>{l.source}</td>
                  <td className="text-xs font-semibold" style={{ color: "var(--c-brand)" }}>
                    {l.budgetMax ? formatTL(parseFloat(l.budgetMax)) : "—"}
                  </td>
                  <td>
                    <span className="stage-badge"
                      style={{ background: stageColors.bg, color: stageColors.text }}>
                      {STAGE_LABELS[l.stage as LeadStage] ?? l.stage}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(l.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!recentLeads.length && (
          <p className="text-center py-12 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Henüz lead yok.
          </p>
        )}
      </div>
    </div>
  );
}
