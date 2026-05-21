"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  leadId: string;
  interactionCount: number;
}

export default function AISummaryButton({ leadId, interactionCount }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (interactionCount === 0) return null;

  async function generateSummary() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/leads/${leadId}/summary`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata");
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!summary ? (
        <button
          onClick={generateSummary}
          disabled={loading}
          className="admin-btn"
          style={{
            background: "var(--c-brand-light)",
            color: "var(--c-brand)",
            border: "1px solid oklch(56% 0.20 38 / 0.20)",
            fontSize: "11px",
          }}
        >
          {loading
            ? <><Loader2 size={12} className="animate-spin" /> Özetleniyor...</>
            : <><Sparkles size={12} /> AI Özet</>
          }
        </button>
      ) : (
        <div
          className="p-3 rounded-xl text-xs leading-relaxed"
          style={{
            background: "var(--c-brand-light)",
            border: "1px solid oklch(56% 0.20 38 / 0.20)",
            color: "var(--c-text-2)",
          }}
        >
          <p className="font-semibold mb-1 flex items-center gap-1.5" style={{ color: "var(--c-brand)" }}>
            <Sparkles size={11} /> AI Özeti
          </p>
          {summary}
          <button
            onClick={() => setSummary(null)}
            className="mt-2 text-xs underline"
            style={{ color: "var(--c-text-subtle)" }}
          >
            Kapat
          </button>
        </div>
      )}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--c-danger)" }}>{error}</p>
      )}
    </div>
  );
}
