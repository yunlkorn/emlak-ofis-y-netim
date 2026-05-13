"use client";

import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2, "Ad soyad zorunludur"),
  phone: z.string().min(10, "Geçerli bir telefon giriniz"),
  email: z.string().email("Geçersiz e-posta").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export default function LeadForm({ listingId, listingTitle }: { listingId?: string; listingTitle?: string }) {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourceListingId: listingId, source: "form" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-teal-800">Talebiniz alındı!</p>
        <p className="text-sm text-teal-600 mt-1">En kısa sürede sizi arayacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-bold text-lg text-gray-800">
        {listingTitle ? `"${listingTitle}" için bilgi al` : "Bilgi Al"}
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Adınız Soyadınız"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="0555 000 00 00"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="ornek@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notunuz</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          placeholder="Ek bilgi veya talebiniz..."
        />
      </div>
      {status === "error" && (
        <p className="text-red-500 text-sm">Bir hata oluştu. Lütfen tekrar deneyin.</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-teal-700 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Gönderiliyor..." : "Bilgi Al"}
      </button>
    </form>
  );
}
