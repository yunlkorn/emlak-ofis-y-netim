"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/schema";

type FormData = {
  refNo: string; title: string; description: string;
  city: string; district: string; neighborhood: string; addressFull: string;
  propertyType: string; listingType: string;
  price: string; currency: string;
  sqm: string; sqmNet: string; rooms: string;
  floor: string; totalFloors: string; buildingAge: string;
  heating: string; parking: boolean; furnished: boolean;
  status: string; isFeatured: boolean;
};

const defaults: FormData = {
  refNo: "", title: "", description: "",
  city: "İstanbul", district: "", neighborhood: "", addressFull: "",
  propertyType: "daire", listingType: "satilik",
  price: "", currency: "TRY",
  sqm: "", sqmNet: "", rooms: "",
  floor: "", totalFloors: "", buildingAge: "",
  heating: "", parking: false, furnished: false,
  status: "aktif", isFeatured: false,
};

function field(label: string, children: React.ReactNode) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const select = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(listing ? {
    refNo: listing.refNo, title: listing.title, description: listing.description,
    city: listing.city, district: listing.district, neighborhood: listing.neighborhood ?? "", addressFull: listing.addressFull ?? "",
    propertyType: listing.propertyType, listingType: listing.listingType,
    price: listing.price, currency: listing.currency,
    sqm: listing.sqm?.toString() ?? "", sqmNet: listing.sqmNet?.toString() ?? "", rooms: listing.rooms ?? "",
    floor: listing.floor ?? "", totalFloors: listing.totalFloors?.toString() ?? "", buildingAge: listing.buildingAge?.toString() ?? "",
    heating: listing.heating ?? "", parking: listing.parking ?? false, furnished: listing.furnished ?? false,
    status: listing.status, isFeatured: listing.isFeatured ?? false,
  } : defaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = listing ? `/api/listings/${listing.id}/admin` : "/api/listings/admin";
      const method = listing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sqm: form.sqm ? parseInt(form.sqm) : undefined,
          sqmNet: form.sqmNet ? parseInt(form.sqmNet) : undefined,
          totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
          buildingAge: form.buildingAge ? parseInt(form.buildingAge) : undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Bir hata oluştu");
      }
      router.push("/admin/ilanlar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("Ref No *", <input required className={input} value={form.refNo} onChange={e => set("refNo", e.target.value)} />)}
        {field("İlan Başlığı *", <input required className={input} value={form.title} onChange={e => set("title", e.target.value)} />)}
      </div>
      {field("Açıklama *", <textarea required rows={4} className={input + " resize-none"} value={form.description} onChange={e => set("description", e.target.value)} />)}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {field("Şehir", <input className={input} value={form.city} onChange={e => set("city", e.target.value)} />)}
        {field("İlçe *", <input required className={input} value={form.district} onChange={e => set("district", e.target.value)} />)}
        {field("Mahalle", <input className={input} value={form.neighborhood} onChange={e => set("neighborhood", e.target.value)} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {field("Mülk Tipi", <select className={select} value={form.propertyType} onChange={e => set("propertyType", e.target.value)}>
          {["daire","villa","mustakil","isyeri","arsa","konut"].map(v => <option key={v} value={v}>{v}</option>)}
        </select>)}
        {field("İlan Tipi", <select className={select} value={form.listingType} onChange={e => set("listingType", e.target.value)}>
          <option value="satilik">Satılık</option>
          <option value="kiralik">Kiralık</option>
        </select>)}
        {field("Fiyat *", <input required type="number" className={input} value={form.price} onChange={e => set("price", e.target.value)} />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {field("Brüt m²", <input type="number" className={input} value={form.sqm} onChange={e => set("sqm", e.target.value)} />)}
        {field("Net m²", <input type="number" className={input} value={form.sqmNet} onChange={e => set("sqmNet", e.target.value)} />)}
        {field("Oda", <input className={input} placeholder="3+1" value={form.rooms} onChange={e => set("rooms", e.target.value)} />)}
        {field("Isıtma", <input className={input} value={form.heating} onChange={e => set("heating", e.target.value)} />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {field("Kat", <input className={input} value={form.floor} onChange={e => set("floor", e.target.value)} />)}
        {field("Toplam Kat", <input type="number" className={input} value={form.totalFloors} onChange={e => set("totalFloors", e.target.value)} />)}
        {field("Bina Yaşı", <input type="number" className={input} value={form.buildingAge} onChange={e => set("buildingAge", e.target.value)} />)}
        {field("Durum", <select className={select} value={form.status} onChange={e => set("status", e.target.value)}>
          {["aktif","beklemede","satildi","kiralandi"].map(v => <option key={v} value={v}>{v}</option>)}
        </select>)}
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.parking} onChange={e => set("parking", e.target.checked)} className="accent-teal-700" />
          Otopark
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.furnished} onChange={e => set("furnished", e.target.checked)} className="accent-teal-700" />
          Eşyalı
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => set("isFeatured", e.target.checked)} className="accent-teal-700" />
          Öne Çıkan
        </label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800">İptal</button>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-60">
          {saving ? "Kaydediliyor..." : listing ? "Güncelle" : "Oluştur"}
        </button>
      </div>
    </form>
  );
}
