"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

type Plan = "baslangic" | "takim" | "kurumsal";

interface FormState {
  // Step 1 — ofis bilgileri
  officeName: string;
  city: string;
  brokerCount: string;
  listingFocus: string;
  // Step 2 — plan
  plan: Plan;
  // Step 3 — hesap
  fullName: string;
  email: string;
  password: string;
}

const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana",
  "Konya", "Gaziantep", "Mersin", "Kocaeli", "Eskişehir", "Diğer",
];

const PLANS: { key: Plan; name: string; price: string; desc: string; features: string[] }[] = [
  {
    key: "baslangic",
    name: "Başlangıç",
    price: "₺499/ay",
    desc: "Tek danışmanlı ofisler için",
    features: ["1 danışman", "Pipeline yönetimi", "WhatsApp bildirimleri"],
  },
  {
    key: "takim",
    name: "Takım",
    price: "₺1.499/ay",
    desc: "Büyüyen ekipler için — en popüler",
    features: ["10 danışmana kadar", "Aksiyon planları", "Günlük hotsheet", "AI özet (sınırsız)"],
  },
  {
    key: "kurumsal",
    name: "Kurumsal",
    price: "₺2.999/ay",
    desc: "Büyük ofisler ve franchise ağları için",
    features: ["Sınırsız danışman", "Sahibinden entegrasyonu", "Onboarding eğitimi"],
  },
];

const STEPS = ["Ofis Bilgileri", "Plan Seçimi", "Hesap Oluştur"];

export default function KayitPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormState>({
    officeName: "",
    city: "",
    brokerCount: "1-3",
    listingFocus: "her_ikisi",
    plan: "takim",
    fullName: "",
    email: "",
    password: "",
  });

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function next() {
    setError("");
    setStep((s) => s + 1);
  }

  function back() {
    setError("");
    setStep((s) => s - 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            office_name: form.officeName,
            city: form.city,
            broker_count: form.brokerCount,
            listing_focus: form.listingFocus,
            plan: form.plan,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const res = await fetch("/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.officeName,
            city: form.city,
            plan: form.plan,
            ownerUserId: data.user.id,
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          console.error("Tenant creation failed:", json);
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--c-bg)" }}>
        <div className="admin-card p-10 w-full max-w-sm text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--c-success-bg)" }}
          >
            <Check size={24} style={{ color: "var(--c-success)" }} />
          </div>
          <h2
            className="text-xl font-black mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
          >
            Hoş geldiniz!
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--c-text-muted)" }}>
            <strong style={{ color: "var(--c-text-2)" }}>{form.email}</strong> adresine onay linki gönderdik. Linke tıklayarak hesabınızı aktifleştirin.
          </p>
          <Link href="/giris" className="admin-btn admin-btn-primary w-full justify-center">
            Giriş Sayfasına Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: "var(--c-bg)" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "var(--c-brand)" }}
        >
          L
        </span>
        <span className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
          LeadHane
        </span>
      </Link>

      <div className="admin-card w-full max-w-lg">
        {/* Step indicator */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: i < step ? "var(--c-success)" : i === step ? "var(--c-brand)" : "var(--c-surface-2)",
                      color: i <= step ? "white" : "var(--c-text-subtle)",
                    }}
                  >
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span
                    className="text-xs font-medium hidden sm:block"
                    style={{ color: i === step ? "var(--c-text)" : "var(--c-text-subtle)" }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: i < step ? "var(--c-success)" : "var(--c-border)" }} />
                )}
              </div>
            ))}
          </div>
          <h1
            className="text-xl font-black mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
          >
            {STEPS[step]}
          </h1>
          <p className="text-sm mb-5" style={{ color: "var(--c-text-muted)" }}>
            {step === 0 && "Ofisiniz hakkında birkaç bilgi alacağız."}
            {step === 1 && "İhtiyacınıza en uygun planı seçin."}
            {step === 2 && "Giriş bilgilerinizi oluşturun."}
          </p>
        </div>

        <div className="px-6 pb-6">
          {/* Step 0 — Ofis bilgileri */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Ofis / Şirket Adı *
                </label>
                <input
                  required
                  className="admin-input"
                  placeholder="Yıldız Gayrimenkul"
                  value={form.officeName}
                  onChange={(e) => set("officeName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Şehir *
                </label>
                <select
                  className="admin-input"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                >
                  <option value="">— Seçin —</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Kaç danışman çalışıyor?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2-5", "6-15", "15+"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("brokerCount", v)}
                      className="py-2 rounded-xl text-sm font-semibold border transition-all"
                      style={{
                        background: form.brokerCount === v ? "var(--c-brand)" : "var(--c-surface)",
                        color: form.brokerCount === v ? "white" : "var(--c-text-2)",
                        borderColor: form.brokerCount === v ? "var(--c-brand)" : "var(--c-border)",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Odak alanı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "satilik", label: "Satılık" },
                    { key: "kiralik", label: "Kiralık" },
                    { key: "her_ikisi", label: "Her İkisi" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("listingFocus", key)}
                      className="py-2 rounded-xl text-sm font-semibold border transition-all"
                      style={{
                        background: form.listingFocus === key ? "var(--c-brand)" : "var(--c-surface)",
                        color: form.listingFocus === key ? "white" : "var(--c-text-2)",
                        borderColor: form.listingFocus === key ? "var(--c-brand)" : "var(--c-border)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={next}
                disabled={!form.officeName || !form.city}
                className="admin-btn admin-btn-primary w-full justify-center mt-2"
              >
                Devam Et <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 1 — Plan */}
          {step === 1 && (
            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => set("plan", plan.key)}
                  className="w-full text-left p-4 rounded-xl border transition-all"
                  style={{
                    background: form.plan === plan.key ? "var(--c-brand-light)" : "var(--c-surface)",
                    borderColor: form.plan === plan.key ? "var(--c-brand)" : "var(--c-border)",
                    borderWidth: form.plan === plan.key ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-bold text-sm"
                      style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
                    >
                      {plan.name}
                    </span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: form.plan === plan.key ? "var(--c-brand)" : "var(--c-text-2)" }}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--c-text-muted)" }}>{plan.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--c-surface-2)", color: "var(--c-text-subtle)" }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={back} className="admin-btn admin-btn-ghost flex-1 justify-center">
                  <ArrowLeft size={14} /> Geri
                </button>
                <button type="button" onClick={next} className="admin-btn admin-btn-primary flex-1 justify-center">
                  Devam Et <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Hesap */}
          {step === 2 && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  Ad Soyad *
                </label>
                <input
                  required
                  className="admin-input"
                  placeholder="Mehmet Yıldız"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--c-text-2)" }}>
                  İş E-postası *
                </label>
                <input
                  required
                  type="email"
                  className="admin-input"
                  placeholder="mehmet@yildizgayrimenkul.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
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

              {/* Summary */}
              <div
                className="p-3 rounded-xl text-xs space-y-1"
                style={{ background: "var(--c-surface-2)" }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--c-text-subtle)" }}>Ofis</span>
                  <span style={{ color: "var(--c-text-2)" }}>{form.officeName}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--c-text-subtle)" }}>Şehir</span>
                  <span style={{ color: "var(--c-text-2)" }}>{form.city}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--c-text-subtle)" }}>Plan</span>
                  <span style={{ color: "var(--c-brand)", fontWeight: 600 }}>
                    {PLANS.find((p) => p.key === form.plan)?.name} — {PLANS.find((p) => p.key === form.plan)?.price}
                  </span>
                </div>
              </div>

              {error && (
                <p
                  className="text-xs p-3 rounded-xl"
                  style={{ background: "var(--c-danger-bg)", color: "var(--c-danger)" }}
                >
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={back} className="admin-btn admin-btn-ghost flex-1 justify-center">
                  <ArrowLeft size={14} /> Geri
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary flex-1 justify-center"
                >
                  {loading ? "Oluşturuluyor..." : "Hesabı Oluştur"}
                </button>
              </div>
              <p className="text-xs text-center" style={{ color: "var(--c-text-subtle)" }}>
                Kaydolarak{" "}
                <span style={{ color: "var(--c-text-muted)" }}>Kullanım Koşulları</span>
                {" "}ve{" "}
                <span style={{ color: "var(--c-text-muted)" }}>Gizlilik Politikası</span>
                &apos;nı kabul etmiş olursunuz.
              </p>
            </form>
          )}

          {step < 2 && (
            <p className="text-xs text-center mt-5" style={{ color: "var(--c-text-subtle)" }}>
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" style={{ color: "var(--c-brand)" }}>
                Giriş yapın
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
