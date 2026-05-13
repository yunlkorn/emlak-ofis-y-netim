import { getStats, getLeads, getListings } from "@/lib/db";
import Link from "next/link";
import { Users, Building2, TrendingUp, Clock } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

const statusColors: Record<string, string> = {
  yeni: "bg-green-100 text-green-700",
  aranildi: "bg-blue-100 text-blue-700",
  gorusme: "bg-yellow-100 text-yellow-700",
  teklif: "bg-purple-100 text-purple-700",
  kapandi: "bg-gray-100 text-gray-500",
  kaybedildi: "bg-red-100 text-red-600",
};

export default async function AdminDashboard() {
  const [stats, recentLeads, topListings] = await Promise.all([
    getStats(),
    getLeads({ limit: 8 }),
    getListings({ status: "aktif", limit: 5 }),
  ]);

  const kpis = [
    { label: "Aktif İlan", value: stats.activeListings, sub: `${stats.totalListings} toplam`, icon: Building2, href: "/admin/ilanlar" },
    { label: "Toplam Lead", value: stats.totalLeads, sub: `+${stats.newLeads} bu hafta`, icon: Users, href: "/admin/leads" },
    { label: "Aktif Danışman", value: stats.activeBrokers, icon: TrendingUp, href: "/admin/brokerlar" },
    { label: "Yeni Lead", value: recentLeads.filter(l => l.status === "yeni").length, icon: Clock, href: "/admin/leads?durum=yeni" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <Icon size={18} className="text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Son Lead&apos;ler</h2>
            <Link href="/admin/leads" className="text-xs text-teal-700 hover:underline">Tümü →</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map((l) => (
              <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{l.fullName}</p>
                  <p className="text-xs text-gray-400">{l.phone} · {l.source}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status] ?? ""}`}>{l.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Son İlanlar</h2>
            <Link href="/admin/ilanlar" className="text-xs text-teal-700 hover:underline">Tümü →</Link>
          </div>
          <div className="space-y-2">
            {topListings.map((l) => (
              <Link key={l.id} href={`/admin/ilanlar/${l.id}`} className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                  <p className="text-xs text-gray-400">{l.district} · {l.refNo}</p>
                </div>
                <span className="text-xs text-gray-500 ml-2 shrink-0">{l.viewCount ?? 0} görüntülenme</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
