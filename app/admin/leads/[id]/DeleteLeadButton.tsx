"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function doDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/leads");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--c-text-muted)" }}>Emin misiniz?</span>
        <button
          onClick={doDelete}
          disabled={deleting}
          className="admin-btn text-xs"
          style={{ background: "var(--c-danger-bg)", color: "var(--c-danger)", border: "1px solid var(--c-danger)" }}
        >
          {deleting ? "Siliniyor..." : "Evet, Sil"}
        </button>
        <button onClick={() => setConfirming(false)} className="admin-btn admin-btn-ghost text-xs">
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="admin-btn admin-btn-ghost text-xs"
      style={{ color: "var(--c-danger)" }}
    >
      <Trash2 size={13} /> Sil
    </button>
  );
}
