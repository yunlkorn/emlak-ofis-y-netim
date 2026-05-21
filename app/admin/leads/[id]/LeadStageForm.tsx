"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, Broker } from "@/lib/schema";
import { STAGE_LABELS, STAGE_ORDER, type LeadStage } from "@/lib/schema";
import { Check } from "lucide-react";

interface Props {
  lead: Lead;
  brokers: Broker[];
  canEdit: boolean;
}

export default function LeadStageForm({ lead, brokers, canEdit }: Props) {
  const router  = useRouter();
  const [stage, setStage]   = useState(lead.stage ?? "yeni");
  const [broker, setBroker] = useState(lead.assignedBrokerId ?? "");
  const [followUp, setFollowUp] = useState(
    lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const brokerChanged = broker !== (lead.assignedBrokerId ?? "");
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          assignedBrokerId: broker || null,
          nextFollowUpAt: followUp || null,
          ...(brokerChanged && broker ? { assignedAt: new Date().toISOString() } : {}),
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const pipelineStages = STAGE_ORDER.filter((s) => !["kapandi","kaybedildi"].includes(s));
  const closingStages  = STAGE_ORDER.filter((s) => ["kapandi","kaybedildi"].includes(s));

  return (
    <div className="admin-card p-5 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider"
        style={{ fontFamily: "var(--font-display)", color: "var(--c-text-subtle)" }}>
        Aşama &amp; Atama
      </h2>

      {/* Stage seçici */}
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: "var(--c-text-2)" }}>Aşama</label>
        <div className="space-y-1">
          {/* Pipeline stages */}
          <div className="flex flex-col gap-1">
            {pipelineStages.map((s) => (
              <button
                key={s}
                disabled={!canEdit}
                onClick={() => setStage(s)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all w-full"
                style={{
                  background: stage === s ? "var(--c-brand-light)" : "transparent",
                  color: stage === s ? "var(--c-brand)" : "var(--c-text-2)",
                  border: `1px solid ${stage === s ? "var(--c-brand)" : "var(--c-border)"}`,
                  opacity: !canEdit ? 0.6 : 1,
                }}
              >
                {stage === s && <Check size={12} />}
                {!( stage === s) && <span className="w-3" />}
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="h-px" style={{ background: "var(--c-border)" }} />
          <div className="flex flex-col gap-1">
            {closingStages.map((s) => (
              <button
                key={s}
                disabled={!canEdit}
                onClick={() => setStage(s)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all w-full"
                style={{
                  background: stage === s ? (s === "kapandi" ? "var(--c-success-bg)" : "var(--c-danger-bg)") : "transparent",
                  color: stage === s ? (s === "kapandi" ? "var(--c-success)" : "var(--c-danger)") : "var(--c-text-2)",
                  border: `1px solid ${stage === s ? (s === "kapandi" ? "var(--c-success)" : "var(--c-danger)") : "var(--c-border)"}`,
                  opacity: !canEdit ? 0.6 : 1,
                }}
              >
                {stage === s && <Check size={12} />}
                {!(stage === s) && <span className="w-3" />}
                {STAGE_LABELS[s as LeadStage]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Atanan danışman */}
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: "var(--c-text-2)" }}>Atanan Danışman</label>
        <select
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          disabled={!canEdit}
          className="admin-input text-xs"
          style={{ opacity: !canEdit ? 0.6 : 1 }}
        >
          <option value="">— Atanmamış —</option>
          {brokers.map((b) => (
            <option key={b.userId} value={b.userId}>{b.fullName}</option>
          ))}
        </select>
      </div>

      {/* Sonraki takip tarihi */}
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: "var(--c-text-2)" }}>Sonraki Takip</label>
        <input
          type="date"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          disabled={!canEdit}
          className="admin-input text-xs"
          style={{ opacity: !canEdit ? 0.6 : 1 }}
        />
      </div>

      {canEdit && (
        <button
          onClick={save}
          disabled={saving}
          className="admin-btn admin-btn-primary w-full justify-center"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      )}
    </div>
  );
}
