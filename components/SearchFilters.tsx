"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

const districts = ["Ataşehir", "Kadıköy", "Ümraniye", "Maltepe", "Kartal", "Pendik", "Beykoz", "Sancaktepe"];
const propertyTypes = [
  { value: "", label: "Tümü" },
  { value: "daire", label: "Daire" },
  { value: "villa", label: "Villa" },
  { value: "mustakil", label: "Müstakil" },
  { value: "isyeri", label: "İşyeri" },
  { value: "arsa", label: "Arsa" },
];

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete("sayfa");
    router.push(`/ilanlar?${sp.toString()}`);
  }, [router, params]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">İlan Tipi</label>
          <select
            value={params.get("tip") ?? ""}
            onChange={(e) => update("tip", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Tümü</option>
            <option value="satilik">Satılık</option>
            <option value="kiralik">Kiralık</option>
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">Mülk Tipi</label>
          <select
            value={params.get("tur") ?? ""}
            onChange={(e) => update("tur", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">İlçe</label>
          <select
            value={params.get("ilce") ?? ""}
            onChange={(e) => update("ilce", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Tümü</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">Min Fiyat</label>
          <input
            type="number"
            placeholder="₺"
            value={params.get("minFiyat") ?? ""}
            onChange={(e) => update("minFiyat", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">Max Fiyat</label>
          <input
            type="number"
            placeholder="₺"
            value={params.get("maxFiyat") ?? ""}
            onChange={(e) => update("maxFiyat", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={() => router.push("/ilanlar")}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Search size={15} />
          Temizle
        </button>
      </div>
    </div>
  );
}
