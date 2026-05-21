import { getListings } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";

export const metadata = { title: "İlanlar — Admin" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, { bg: string; text: string }> = {
  aktif:     { bg: "var(--c-success-bg)", text: "var(--c-success)" },
  satildi:   { bg: "oklch(92% 0.01 260)", text: "var(--c-text-muted)" },
  kiralandi: { bg: "oklch(92% 0.01 260)", text: "var(--c-text-muted)" },
  beklemede: { bg: "var(--c-warning-bg)", text: "var(--c-warning)" },
};

export default async function AdminIlanlarPage() {
  const [list, role] = await Promise.all([
    getListings({ limit: 100 }),
    getSessionRole(),
  ]);
  const canEdit = role === "admin" || role === "broker";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            İlanlar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
            {list.length} ilan
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/ilanlar/yeni" className="admin-btn admin-btn-primary">
            <Plus size={14} /> Yeni İlan
          </Link>
        )}
      </div>

      <div className="admin-card overflow-hidden fade-up fade-up-1">
        <table className="data-table">
          <thead>
            <tr>
              {["Ref No", "Başlık", "Tip", "İlçe", "Fiyat", "Durum", "Görüntülenme", ""].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((l) => {
              const sc = statusColors[l.status] ?? { bg: "var(--c-surface-2)", text: "var(--c-text-muted)" };
              return (
                <tr key={l.id}>
                  <td className="text-xs font-mono" style={{ color: "var(--c-text-subtle)" }}>
                    {l.refNo}
                  </td>
                  <td>
                    <Link
                      href={`/admin/ilanlar/${l.id}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
                    >
                      {l.title}
                    </Link>
                    {l.neighborhood && (
                      <p className="text-xs" style={{ color: "var(--c-text-subtle)" }}>{l.neighborhood}</p>
                    )}
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: "var(--c-surface-2)", color: "var(--c-text-muted)" }}>
                      {l.listingType === "satilik" ? "Satılık" : "Kiralık"}
                    </span>
                  </td>
                  <td style={{ color: "var(--c-text-muted)", fontSize: "13px" }}>{l.district}</td>
                  <td className="font-semibold text-sm" style={{ color: "var(--c-brand)" }}>
                    {parseInt(l.price).toLocaleString("tr-TR")} ₺
                  </td>
                  <td>
                    <span className="stage-badge" style={{ background: sc.bg, color: sc.text }}>
                      {l.status === "aktif" ? "Aktif"
                        : l.status === "satildi" ? "Satıldı"
                        : l.status === "kiralandi" ? "Kiralandı"
                        : "Beklemede"}
                    </span>
                  </td>
                  <td style={{ color: "var(--c-text-subtle)", fontSize: "13px" }}>
                    <span className="flex items-center gap-1"><Eye size={12} />{l.viewCount ?? 0}</span>
                  </td>
                  <td>
                    {canEdit && (
                      <Link
                        href={`/admin/ilanlar/${l.id}`}
                        className="admin-btn admin-btn-ghost text-xs"
                        style={{ padding: "4px 10px" }}
                      >
                        Düzenle
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && (
          <p className="text-center py-12 text-sm" style={{ color: "var(--c-text-muted)" }}>
            İlan bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
