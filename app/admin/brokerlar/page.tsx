import { getBrokers } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import Link from "next/link";
import { Mail, Phone, Plus } from "lucide-react";
import BrokerActions from "./BrokerActions";
import AccessDenied from "../AccessDenied";

export const metadata = { title: "Danışmanlar — Admin" };

export default async function AdminBrokerlarPage() {
  const role = await getSessionRole();
  if (role !== "admin") return <AccessDenied message="Danışman yönetimi sadece adminlere açıktır." />;

  const list = await getBrokers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Danışmanlar</h1>
        <Link href="/admin/brokerlar/yeni" className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-800 transition-colors">
          <Plus size={16} />Yeni Danışman
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b) => (
          <div key={b.userId} className={`bg-white rounded-xl border p-5 ${b.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                  {b.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{b.fullName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.role === "admin" ? "bg-purple-100 text-purple-700" :
                    b.role === "stajyer" ? "bg-gray-100 text-gray-500" :
                    "bg-teal-100 text-teal-700"
                  }`}>
                    {b.role === "admin" ? "Admin" : b.role === "stajyer" ? "Stajyer" : "Danışman"}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                {b.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-500 mb-4">
              <a href={`tel:${b.phone}`} className="flex items-center gap-2 hover:text-teal-700"><Phone size={12} />{b.phone}</a>
              <a href={`mailto:${b.email}`} className="flex items-center gap-2 hover:text-teal-700"><Mail size={12} />{b.email}</a>
            </div>
            <BrokerActions broker={b} />
          </div>
        ))}
      </div>
    </div>
  );
}
