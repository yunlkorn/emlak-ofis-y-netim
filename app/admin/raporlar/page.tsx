import { getBrokerStats, getStats } from "@/lib/db";
import { TrendingUp, Award, Clock, Phone, MessageCircle, Target, BarChart3 } from "lucide-react";

export const metadata = { title: "Raporlar — Admin" };
export const dynamic  = "force-dynamic";

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toLocaleString("tr-TR")} ₺`;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="admin-card p-5 fade-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--c-text-subtle)", fontFamily: "var(--font-display)" }}>
          {label}
        </p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: color ? `${color}18` : "var(--c-surface-2)" }}>
          <Icon size={15} style={{ color: color ?? "var(--c-brand)" }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--c-text-muted)" }}>{sub}</p>}
    </div>
  );
}

export default async function RaporlarPage() {
  const [stats, brokerStats] = await Promise.all([
    getStats(),
    getBrokerStats(),
  ]);

  const totalPipeline = brokerStats.reduce((s, b) => s + b.pipelineValue, 0);
  // En iyi danışman: en az 1 lead atanmış olanlar arasından kapanan sayısına göre
  const bestBroker = [...brokerStats]
    .filter((b) => b.assignedLeads > 0)
    .sort((a, b) => b.closedLeads - a.closedLeads || b.conversionRate - a.conversionRate)[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="fade-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Raporlar
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-text-muted)" }}>
          Son 30 günlük performans özeti
        </p>
      </div>

      {/* Ofis geneli özet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Aktif Pipeline"
          value={formatTL(totalPipeline)}
          sub="Tüm danışmanlar"
          color="var(--c-brand)"
        />
        <StatCard
          icon={Target}
          label="Bu Ay Kapanan"
          value={`${stats.closedThisMonth}`}
          sub={`Toplam ciro: ${formatTL(stats.totalCiroThisMonth)}`}
          color="var(--c-success)"
        />
        <StatCard
          icon={Award}
          label="En İyi Danışman"
          value={bestBroker?.broker.fullName?.split(" ")[0] ?? "—"}
          sub={bestBroker ? `%${bestBroker.conversionRate} dönüşüm` : undefined}
          color="var(--c-warning)"
        />
        <StatCard
          icon={BarChart3}
          label="Toplam Lead"
          value={`${stats.totalLeads}`}
          sub={`Bu hafta +${stats.newLeads} yeni`}
          color="var(--c-info)"
        />
      </div>

      {/* Broker performans tablosu */}
      <div className="admin-card overflow-hidden fade-up fade-up-2">
        <div className="p-5 pb-0">
          <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Danışman Performansı
          </h2>
          <p className="text-xs mt-0.5 mb-4" style={{ color: "var(--c-text-muted)" }}>
            Son 30 gün · Atanan lead, yanıt süresi ve dönüşüm
          </p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {["Danışman", "Atanan Lead", "Dönüşüm", "Ortalama Yanıt", "Aramalar", "WhatsApp", "Pipeline Değeri"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brokerStats.map(({ broker, assignedLeads, closedLeads, conversionRate, pipelineValue, calls, waMsgs, avgResponseTime }) => (
              <tr key={broker.userId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: "var(--c-brand)" }}
                    >
                      {broker.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        {broker.fullName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
                        {broker.role === "admin" ? "Admin" : "Danışman"}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-semibold">{assignedLeads}</span>
                  <span className="text-xs ml-1" style={{ color: "var(--c-text-muted)" }}>
                    ({closedLeads} kapandı)
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--c-border)", maxWidth: 60 }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${conversionRate}%`,
                          background: conversionRate >= 30
                            ? "var(--c-success)"
                            : conversionRate >= 15
                            ? "var(--c-warning)"
                            : "var(--c-danger)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold" style={{
                      color: conversionRate >= 30 ? "var(--c-success)" : conversionRate >= 15 ? "var(--c-warning)" : "var(--c-danger)"
                    }}>
                      %{conversionRate}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--c-text-2)" }}>
                    <Clock size={12} />
                    {avgResponseTime > 0 ? `${avgResponseTime}dk` : "—"}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--c-text-2)" }}>
                    <Phone size={12} />
                    {calls}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--c-text-2)" }}>
                    <MessageCircle size={12} />
                    {waMsgs}
                  </span>
                </td>
                <td>
                  <span className="font-semibold text-sm" style={{ color: "var(--c-brand)" }}>
                    {formatTL(pipelineValue)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!brokerStats.length && (
          <p className="text-center py-12 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Henüz veri yok.
          </p>
        )}
      </div>
    </div>
  );
}
