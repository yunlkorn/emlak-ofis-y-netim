"use client";

import { useState } from "react";
import type { Lead, Broker } from "@/lib/schema";

const statuses = ["yeni", "aranildi", "gorusme", "teklif", "kapandi", "kaybedildi"] as const;

export default function LeadStatusForm({
  lead, brokers, canEdit,
}: {
  lead: Lead; brokers: Broker[]; canEdit: boolean;
}) {
  const [status, setStatus] = useState(lead.status);
  const [brokerId, setBrokerId] = useState(lead.assignedBrokerId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, assignedBrokerId: brokerId || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">Durum & Atama</h2>

      {!canEdit && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          Durum değiştirme yetkiniz bulunmuyor.
        </p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Durum</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          disabled={!canEdit}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Atanan Danışman</label>
        <select
          value={brokerId}
          onChange={(e) => setBrokerId(e.target.value)}
          disabled={!canEdit}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">— Atanmamış —</option>
          {brokers.map((b) => <option key={b.userId} value={b.userId}>{b.fullName}</option>)}
        </select>
      </div>

      {canEdit && (
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      )}
    </div>
  );
}
