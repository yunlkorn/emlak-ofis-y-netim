import { getLeads } from "@/lib/db";
import Link from "next/link";

interface Props { searchParams: Promise<{ durum?: string; kaynak?: string }> }

const statusColors: Record<string, string> = {
  yeni: "bg-green-100 text-green-700",
  aranildi: "bg-blue-100 text-blue-700",
  gorusme: "bg-yellow-100 text-yellow-700",
  teklif: "bg-purple-100 text-purple-700",
  kapandi: "bg-gray-100 text-gray-500",
  kaybedildi: "bg-red-100 text-red-600",
};

export const metadata = { title: "Lead'ler — Admin" };

export default async function AdminLeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const list = await getLeads({ status: sp.durum, source: sp.kaynak });
  const statuses = ["yeni", "aranildi", "gorusme", "teklif", "kapandi", "kaybedildi"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lead&apos;ler</h1>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/leads" className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${!sp.durum ? "bg-teal-700 text-white border-teal-700" : "border-gray-200 text-gray-500 hover:border-teal-400"}`}>Tümü</Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/leads?durum=${s}`} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${sp.durum === s ? "bg-teal-700 text-white border-teal-700" : "border-gray-200 text-gray-500 hover:border-teal-400"}`}>{s}</Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Ad Soyad", "Telefon", "Tip", "İlçe", "Bütçe", "Kaynak", "Durum", "Tarih"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><Link href={`/admin/leads/${l.id}`} className="font-medium text-gray-800 hover:text-teal-700">{l.fullName}</Link></td>
                <td className="px-4 py-3 text-gray-500">{l.phone}</td>
                <td className="px-4 py-3 text-gray-500">{l.listingType ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{l.district ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{l.budgetMax ? `₺${parseInt(l.budgetMax).toLocaleString("tr-TR")}` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{l.source}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status] ?? ""}`}>{l.status}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(l.createdAt).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="text-center py-12 text-gray-400">Lead bulunamadı.</p>}
      </div>
    </div>
  );
}
