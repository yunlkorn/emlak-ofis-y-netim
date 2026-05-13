"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const channels = ["telefon", "whatsapp", "sms", "email", "yuzyuze", "not"] as const;

export default function AddInteractionForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ channel: "telefon" as typeof channels[number], direction: "giden" as "giden" | "gelen", content: "" });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/leads/${leadId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setOpen(false);
    setForm({ channel: "telefon", direction: "giden", content: "" });
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 text-sm text-teal-700 hover:underline">
        + Etkileşim Ekle
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Kanal</label>
          <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as typeof channels[number] })} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
            {channels.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Yön</label>
          <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as "giden" | "gelen" })} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
            <option value="giden">Giden</option>
            <option value="gelen">Gelen</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Not</label>
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1">İptal</button>
        <button type="submit" disabled={saving} className="text-sm bg-teal-700 text-white px-4 py-1.5 rounded-lg hover:bg-teal-800 disabled:opacity-60">
          {saving ? "..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
