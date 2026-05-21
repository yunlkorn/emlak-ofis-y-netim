"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { SOURCE_LABELS, type LeadSource } from "@/lib/schema";

const SOURCES = Object.entries(SOURCE_LABELS) as [LeadSource, string][];

export default function NewLeadModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    source: "direkt" as LeadSource,
    district: "", city: "",
    budgetMin: "", budgetMax: "",
    listingType: "" as "" | "satilik" | "kiralik",
    roomsPreference: "", notes: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          listingType: form.listingType || undefined,
          budgetMin: form.budgetMin ? parseFloat(form.budgetMin) : undefined,
          budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
          email: form.email || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] ?? json.error ?? "Hata");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="admin-btn admin-btn-primary">
        <Plus size={14} /> Yeni Lead
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0% 0 0 / 0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="admin-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-center justify-between p-5 pb-4"
              style={{ borderBottom: "1px solid var(--c-border)" }}>
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                Yeni Lead
              </h2>
              <button onClick={() => setOpen(false)} className="admin-btn admin-btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Ad Soyad *
                  </label>
                  <input
                    required className="admin-input"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Telefon *
                  </label>
                  <input
                    required className="admin-input"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="05551234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    E-posta
                  </label>
                  <input
                    type="email" className="admin-input"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="ahmet@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Kaynak
                  </label>
                  <select
                    className="admin-input"
                    value={form.source}
                    onChange={(e) => set("source", e.target.value)}
                  >
                    {SOURCES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    İlan Tipi
                  </label>
                  <select
                    className="admin-input"
                    value={form.listingType}
                    onChange={(e) => set("listingType", e.target.value)}
                  >
                    <option value="">— Seçin —</option>
                    <option value="satilik">Satılık</option>
                    <option value="kiralik">Kiralık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Şehir
                  </label>
                  <input
                    className="admin-input"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="İstanbul"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    İlçe
                  </label>
                  <input
                    className="admin-input"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    placeholder="Ataşehir"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Min Bütçe (₺)
                  </label>
                  <input
                    type="number" className="admin-input"
                    value={form.budgetMin}
                    onChange={(e) => set("budgetMin", e.target.value)}
                    placeholder="3000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Max Bütçe (₺)
                  </label>
                  <input
                    type="number" className="admin-input"
                    value={form.budgetMax}
                    onChange={(e) => set("budgetMax", e.target.value)}
                    placeholder="6000000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Oda Tercihi
                  </label>
                  <input
                    className="admin-input"
                    value={form.roomsPreference}
                    onChange={(e) => set("roomsPreference", e.target.value)}
                    placeholder="3+1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--c-text-2)" }}>
                    Notlar
                  </label>
                  <textarea
                    className="admin-input resize-none"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Müşteri hakkında notlar..."
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs p-3 rounded-xl" style={{ background: "var(--c-danger-bg)", color: "var(--c-danger)" }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setOpen(false)} className="admin-btn admin-btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                  {saving ? "Oluşturuluyor..." : "Lead Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
