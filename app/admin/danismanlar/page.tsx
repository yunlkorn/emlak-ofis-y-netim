import { getBrokers } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import AddBrokerModal from "./AddBrokerModal";

export const metadata = { title: "Danışmanlar — Admin" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  admin:    "Admin",
  broker:   "Danışman",
  stajyer:  "Stajyer",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:   { bg: "var(--c-brand-light)",   text: "var(--c-brand)"   },
  broker:  { bg: "var(--c-info-bg)",       text: "var(--c-info)"    },
  stajyer: { bg: "var(--c-surface-2)",     text: "var(--c-text-muted)" },
};

export default async function DanismanlarPage() {
  const role = await getSessionRole();
  if (role !== "admin") redirect("/admin");

  const brokers = await getBrokers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Danışmanlar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
            {brokers.filter((b) => b.isActive).length} aktif danışman
          </p>
        </div>
        <AddBrokerModal />
      </div>

      <div className="admin-card overflow-x-auto fade-up fade-up-1">
        <table className="data-table">
          <thead>
            <tr>
              {["Ad Soyad", "E-posta", "Telefon", "Rol", "Bu Ay Lead", "Kapanış Oranı", "Durum"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brokers.map((b) => {
              const roleColor = ROLE_COLORS[b.role] ?? ROLE_COLORS.broker;
              return (
                <tr key={b.userId}>
                  <td>
                    <div className="font-semibold" style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}>
                      {b.fullName}
                    </div>
                  </td>
                  <td style={{ color: "var(--c-text-2)", fontSize: 13 }}>{b.email}</td>
                  <td style={{ color: "var(--c-text-muted)", fontSize: 13 }}>{b.phone}</td>
                  <td>
                    <span
                      className="stage-badge"
                      style={{ background: roleColor.bg, color: roleColor.text }}
                    >
                      {ROLE_LABELS[b.role] ?? b.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--c-text-2)", fontSize: 13 }}>
                    {b.currentMonthLeads ?? 0}
                  </td>
                  <td style={{ color: "var(--c-text-2)", fontSize: 13 }}>
                    {b.conversionRate ? `%${parseFloat(String(b.conversionRate)).toFixed(1)}` : "—"}
                  </td>
                  <td>
                    <span
                      className="stage-badge"
                      style={{
                        background: b.isActive ? "var(--c-success-bg)" : "var(--c-danger-bg)",
                        color: b.isActive ? "var(--c-success)" : "var(--c-danger)",
                      }}
                    >
                      {b.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!brokers.length && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Users size={28} style={{ color: "var(--c-text-subtle)" }} />
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Henüz danışman eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}
