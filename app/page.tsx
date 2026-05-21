import Link from "next/link";
import { ArrowRight, Zap, GitBranch, Bot, Bell, BarChart3, Check } from "lucide-react";

export const metadata = {
  title: "LeadHane — Emlak Ofisleri için Akıllı CRM",
  description: "Pipeline yönetimi, Speed-to-Lead, aksiyon planları ve günlük hotsheet ile leadlerinizi kapanışa taşıyın.",
};

const FEATURES = [
  {
    icon: GitBranch,
    title: "Görsel Pipeline",
    desc: "Kanban board ile leadlerinizi sürükle-bırak ile yönetin. Hangi aşamada kaç lead var, bir bakışta görün.",
  },
  {
    icon: Zap,
    title: "Speed-to-Lead",
    desc: "Yeni lead geldiğinde sistem otomatik olarak müsait danışmanı atar ve WhatsApp bildirimi gönderir. Ortalama yanıt süresi 4 dakikaya iner.",
  },
  {
    icon: Bot,
    title: "Aksiyon Planları",
    desc: "Her lead için önceden tanımlanmış takip adımları otomatik işler. Hiçbir müşteri unutulmaz.",
  },
  {
    icon: Bell,
    title: "Günlük Hotsheet",
    desc: "Her sabah 08:30'da danışmanlarınız o günün takip listesini WhatsApp'ta hazır bulur.",
  },
  {
    icon: Bot,
    title: "AI Özeti",
    desc: "Müşteri görüşme geçmişini Claude AI ile tek tıkla özetleyin. Toplantıya her zaman hazır gelin.",
  },
  {
    icon: BarChart3,
    title: "Performans Raporları",
    desc: "Danışman bazında kapanış oranı, ortalama yanıt süresi ve lead dağılımını anlık takip edin.",
  },
];

const PLANS = [
  {
    key: "baslangic",
    name: "Başlangıç",
    price: "499",
    brokers: "1 danışman",
    features: ["Pipeline yönetimi", "Speed-to-Lead", "WhatsApp bildirimleri", "AI özet (10/ay)"],
    cta: "Ücretsiz Dene",
    highlight: false,
  },
  {
    key: "takim",
    name: "Takım",
    price: "1.499",
    brokers: "10 danışmana kadar",
    features: ["Tüm Başlangıç özellikleri", "Aksiyon planları", "Günlük hotsheet", "Performans raporları", "AI özet (sınırsız)"],
    cta: "14 Gün Ücretsiz",
    highlight: true,
  },
  {
    key: "kurumsal",
    name: "Kurumsal",
    price: "2.999",
    brokers: "Sınırsız danışman",
    features: ["Tüm Takım özellikleri", "Sahibinden entegrasyonu", "Özel aksiyon planları", "Öncelikli destek", "Onboarding eğitimi"],
    cta: "Satış Ekibiyle Görüş",
    highlight: false,
  },
];

const STATS = [
  { value: "4 dk", label: "Ortalama yanıt süresi" },
  { value: "%34", label: "Kapanış oranı artışı" },
  { value: "0", label: "Kaçırılan takip" },
  { value: "08:30", label: "Günlük hazırlık saati" },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--c-bg)", color: "var(--c-text)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "oklch(from var(--c-bg) l c h / 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "var(--c-brand)" }}
          >
            L
          </span>
          <span className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
            LeadHane
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/giris"
            className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ color: "var(--c-text-2)" }}
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="admin-btn admin-btn-primary text-sm"
          >
            Ücretsiz Başla <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(56% 0.20 38 / 0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "var(--c-brand-light)", color: "var(--c-brand)", border: "1px solid oklch(56% 0.20 38 / 0.2)" }}
          >
            <Zap size={11} /> Türkiye&apos;nin ilk Speed-to-Lead CRM&apos;i
          </div>
          <h1
            className="text-5xl md:text-6xl font-black leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
          >
            Emlak leadleri için<br />
            <span style={{ color: "var(--c-brand)" }}>saniyeler sayılır.</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-10 mx-auto" style={{ color: "var(--c-text-muted)", maxWidth: "560px" }}>
            Pipeline yönetimi, otomatik danışman ataması ve günlük WhatsApp hotsheet ile hiçbir leadinizi kaybetmeyin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit" className="admin-btn admin-btn-primary px-8 py-3 text-base">
              14 Gün Ücretsiz Dene <ArrowRight size={16} />
            </Link>
            <Link
              href="#ozellikler"
              className="admin-btn admin-btn-ghost px-8 py-3 text-base"
            >
              Özellikleri Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-6" style={{ borderTop: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div
                className="text-3xl font-black mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--c-brand)" }}
              >
                {value}
              </div>
              <div className="text-sm" style={{ color: "var(--c-text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
            >
              Her şey bir arada
            </h2>
            <p className="text-base" style={{ color: "var(--c-text-muted)", maxWidth: "480px", margin: "0 auto" }}>
              Leadden kapanışa kadar tüm süreci tek platformdan yönetin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="admin-card p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--c-brand-light)" }}
                >
                  <Icon size={18} style={{ color: "var(--c-brand)" }} />
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-20 px-6"
        style={{ background: "var(--c-surface)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl font-black mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
          >
            Speed-to-Lead nasıl çalışır?
          </h2>
          <p className="text-sm mb-14" style={{ color: "var(--c-text-muted)" }}>
            Yeni bir lead geldiğinde sistem 4 adımda devreye girer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Lead giriyor", desc: "Web formu, Sahibinden veya manuel ekleme" },
              { step: "02", title: "Skor hesaplanıyor", desc: "Bütçe, kaynak ve iletişim verilerine göre 0-100" },
              { step: "03", title: "Danışman atanıyor", desc: "Round-robin + kıdemli öncelik algoritması" },
              { step: "04", title: "WhatsApp geliyor", desc: "Danışman anında bilgilendirilir, takip başlar" },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < 3 && (
                  <div
                    className="hidden sm:block absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-px"
                    style={{ background: "var(--c-border)" }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3 relative z-10"
                  style={{ background: "var(--c-brand)", color: "white", fontFamily: "var(--font-display)" }}
                >
                  {step}
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: "var(--c-text)" }}>{title}</div>
                <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlar" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
            >
              Şeffaf fiyatlandırma
            </h2>
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
              Gizli ücret yok. İstediğiniz zaman iptal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="admin-card p-6 flex flex-col"
                style={plan.highlight ? {
                  border: "2px solid var(--c-brand)",
                  boxShadow: "0 0 0 4px oklch(56% 0.20 38 / 0.08)",
                } : {}}
              >
                {plan.highlight && (
                  <div
                    className="text-xs font-bold px-3 py-1 rounded-full mb-4 self-start"
                    style={{ background: "var(--c-brand)", color: "white" }}
                  >
                    En Popüler
                  </div>
                )}
                <div
                  className="text-lg font-black mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
                >
                  {plan.name}
                </div>
                <div className="mb-1">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}
                  >
                    ₺{plan.price}
                  </span>
                  <span className="text-sm ml-1" style={{ color: "var(--c-text-muted)" }}>/ay</span>
                </div>
                <div className="text-xs mb-6" style={{ color: "var(--c-text-subtle)" }}>{plan.brokers}</div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--c-text-2)" }}>
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--c-brand)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kayit"
                  className={`admin-btn w-full justify-center${plan.highlight ? " admin-btn-primary" : " admin-btn-ghost"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{
          background: "var(--c-brand)",
        }}
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-4 text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Leadlerinizi kapanışa taşımaya hazır mısınız?
        </h2>
        <p className="text-base mb-8" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
          14 gün ücretsiz, kredi kartı gerekmez.
        </p>
        <Link
          href="/kayit"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all"
          style={{ background: "white", color: "var(--c-brand)" }}
        >
          Hemen Başla <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{ color: "var(--c-text-subtle)", borderTop: "1px solid var(--c-border)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--c-brand)" }}
          >
            L
          </span>
          <span className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--c-text-2)" }}>
            LeadHane
          </span>
        </div>
        <p>© 2026 LeadHane. Tüm hakları saklıdır.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/giris" style={{ color: "var(--c-text-subtle)" }}>Giriş Yap</Link>
          <Link href="/kayit" style={{ color: "var(--c-text-subtle)" }}>Kayıt Ol</Link>
        </div>
      </footer>
    </div>
  );
}
