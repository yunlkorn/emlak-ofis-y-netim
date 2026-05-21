import { getBrokers } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import Link from "next/link";
import { Mail, Phone, Plus } from "lucide-react";
import BrokerActions from "./BrokerActions";
import AccessDenied from "../AccessDenied";

export const metadata = { title: "Danışmanlar — Admin" };
export const dynamic = "force-dynamic";

const roleColors: Record<string, { bg: string; text: string }> = {
  admin:   { bg: "oklch(94% 0.06 290)", text: "oklch(54% 0.20 290)" },
  broker:  { bg: "var(--c-brand-light)", text: "var(--c-brand)" },
  stajyer: { bg: "oklch(93% 0.01 260)", text: "var(--c-text-muted)" },
};
const roleLabels: Record<string, string> = { admin: "Admin", broker: "Danışman", stajyer: "Stajyer" };

export default async function AdminBrokerlarPage() {
  const role = await getSessionRole();
  if (role !== "admin") return <AccessDenied message="Danışman yönetimi sadece adminlere açıktır." />;

  const list = await getBrokers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Danışmanlar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
            {list.filter((b) => b.isActive).length} aktif danışman
          </p>
        </div>
        <Link href="/admin/brokerlar/yeni" className="admin-btn admin-btn-primary">
          <Plus size={14} /> Yeni Danışman
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b, i) => {
          const rc = roleColors[b.role] ?? roleColors.broker;
          return (
            <div
              key={b.userId}
              className="admin-card p-5 fade-up"
              style={{
                animationDelay: `${i * 40}ms`,
                opacity: b.isActive ? 1 : 0.55,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: "var(--c-brand)" }}
                  >
                    {b.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
                      {b.fullName}
                    </p>
                    <span
                      className="stage-badge mt-0.5"
                      style={{ background: rc.bg, color: rc.text }}
                    >
                      {roleLabels[b.role]}
                    </span>
                  </div>
                </div>
                <span
                  className="stage-badge"
                  style={{
                    background: b.isActive ? "var(--c-success-bg)" : "var(--c-danger-bg)",
                    color: b.isActive ? "var(--c-success)" : "var(--c-danger)",
                  }}
                >
                  {b.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              {/* İletişim */}
              <div className="space-y-1.5 mb-4">
                <a
                  href={`tel:${b.phone}`}
                  className="flex items-center gap-2 text-xs transition-colors"
                  style={{ color: "var(--c-text-muted)" }}
                >
                  <Phone size={12} /> {b.phone}
                </a>
                <a
                  href={`mailto:${b.email}`}
                  className="flex items-center gap-2 text-xs transition-colors"
                  style={{ color: "var(--c-text-muted)" }}
                >
                  <Mail size={12} /> {b.email}
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-3 mb-4 text-xs" style={{ color: "var(--c-text-subtle)" }}>
                <div className="text-center">
                  <div className="font-bold text-base" style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}>
                    {b.currentMonthLeads ?? 0}
                  </div>
                  <div>Bu ay</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base" style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}>
                    {b.dailyLeadLimit ?? 10}
                  </div>
                  <div>Günlük limit</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base" style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}>
                    %{b.conversionRate ?? 0}
                  </div>
                  <div>Dönüşüm</div>
                </div>
              </div>

              <BrokerActions broker={b} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
