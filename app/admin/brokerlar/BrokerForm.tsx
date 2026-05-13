"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrokerForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "",
    role: "broker" as "admin" | "broker" | "stajyer",
    officeName: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Bir hata oluştu");
      router.push("/admin/brokerlar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ad Soyad *</label>
        <input required className={inputCls} value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Ahmet Yılmaz" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">E-posta *</label>
        <input required type="email" className={inputCls} value={form.email} onChange={e => set("email", e.target.value)} placeholder="ahmet@ofis.com" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Telefon *</label>
        <input required className={inputCls} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+905551234567" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Şifre * (min. 8 karakter)</label>
        <input required type="password" minLength={8} className={inputCls} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
        <select className={inputCls} value={form.role} onChange={e => set("role", e.target.value)}>
          <option value="broker">Danışman</option>
          <option value="stajyer">Stajyer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ofis Adı</label>
        <input className={inputCls} value={form.officeName} onChange={e => set("officeName", e.target.value)} placeholder="Ataşehir Emlak" />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => router.back()} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800">İptal</button>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-60">
          {saving ? "Oluşturuluyor..." : "Danışman Ekle"}
        </button>
      </div>
    </form>
  );
}
