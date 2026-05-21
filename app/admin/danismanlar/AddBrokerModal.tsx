"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, AlertTriangle } from "lucide-react";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "broker" | "stajyer";
}

export default function AddBrokerModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "broker",
  });

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function close() {
    setOpen(false);
    setError("");
    setLimitReached(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.limitReached) setLimitReached(true);
        throw new Error(json.error ?? "Hata oluştu");
      }

      close();
      setForm({ fullName: "", email: "", phone: "", password: "", role: "broker" });
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
        <Plus size={14} /> Danışman Ekle
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0% 0 0 / 0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="admin-card w-full max-w-md"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div
              className="flex items-center justify-between p-5 pb-4"
              style={{ borderBottom: "1px solid var(--c-border)" }}
            >
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                Yeni Danışman
              </h2>
              <button onClick={close} className="admin-btn admin-btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Ad Soyad *
                </label>
                <input
                  required
                  className="admin-input"
                  placeholder="Ayşe Kaya"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                    E-posta *
                  </label>
                  <input
                    required
                    type="email"
                    className="admin-input"
                    placeholder="ayse@ofis.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                    Telefon *
                  </label>
                  <input
                    required
                    className="admin-input"
                    placeholder="05551234567"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                    Şifre *
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    className="admin-input"
                    placeholder="En az 6 karakter"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                    Rol
                  </label>
                  <select
                    className="admin-input"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value as FormState["role"])}
                  >
                    <option value="broker">Danışman</option>
                    <option value="stajyer">Stajyer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-xs"
                  style={{
                    background: limitReached ? "var(--c-warning-bg, var(--c-danger-bg))" : "var(--c-danger-bg)",
                    color: limitReached ? "var(--c-warning, var(--c-danger))" : "var(--c-danger)",
                  }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {limitReached && (
                      <a
                        href="/admin/ayarlar"
                        className="underline mt-1 inline-block font-semibold"
                      >
                        Planı yükselt →
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={close} className="admin-btn admin-btn-ghost">
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving ? "Ekleniyor..." : "Danışman Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
