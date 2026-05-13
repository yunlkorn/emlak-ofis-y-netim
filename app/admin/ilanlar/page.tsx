import { getListings } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "İlanlar — Admin" };

const statusBadge: Record<string, string> = {
  aktif: "bg-green-100 text-green-700",
  satildi: "bg-gray-100 text-gray-500",
  kiralandi: "bg-gray-100 text-gray-500",
  beklemede: "bg-yellow-100 text-yellow-700",
};

export default async function AdminIlanlarPage() {
  const [list, role] = await Promise.all([getListings({ limit: 100 }), getSessionRole()]);
  const canEdit = role === "admin" || role === "broker";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">İlanlar</h1>
        {canEdit && (
          <Link href="/admin/ilanlar/yeni" className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-800 transition-colors">
            <Plus size={16} />Yeni İlan
          </Link>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Ref", "Başlık", "Tip", "İlçe", "Fiyat", "Durum", "Görüntülenme", ...(canEdit ? [""] : [])].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs">{l.refNo}</td>
                <td className="px-4 py-3 max-w-xs"><p className="font-medium text-gray-800 truncate">{l.title}</p></td>
                <td className="px-4 py-3 text-gray-500">{l.listingType}</td>
                <td className="px-4 py-3 text-gray-500">{l.district}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">₺{parseInt(l.price).toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[l.status] ?? ""}`}>{l.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{l.viewCount ?? 0}</td>
                {canEdit && (
                  <td className="px-4 py-3"><Link href={`/admin/ilanlar/${l.id}`} className="text-xs text-teal-700 hover:underline">Düzenle</Link></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="text-center py-12 text-gray-400">İlan bulunamadı.</p>}
      </div>
    </div>
  );
}
