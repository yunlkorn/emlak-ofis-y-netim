import Link from "next/link";
import { getListings } from "@/lib/db";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ListingCard from "@/components/ListingCard";
import { Phone, Star, Shield, Clock } from "lucide-react";

export default async function HomePage() {
  const featured = await getListings({ status: "aktif", isFeatured: true, limit: 6 });
  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi";
  const phone = process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "";

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-teal-800 to-teal-600 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{officeName}</h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8">
              İstanbul&apos;un en değerli lokasyonlarında güvenilir emlak danışmanlığı
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ilanlar?tip=satilik" className="bg-white text-teal-800 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
                Satılık İlanlar
              </Link>
              <Link href="/ilanlar?tip=kiralik" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-teal-800 transition-colors">
                Kiralık İlanlar
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Güvenilir Danışmanlık", desc: "Lisanslı ve deneyimli ekibimizle güvenli işlem garantisi." },
                { icon: Star, title: "Seçkin Portföy", desc: "İstanbul'un en iyi lokasyonlarından özenle seçilmiş ilanlar." },
                { icon: Clock, title: "Hızlı Dönüş", desc: "Talebinize 30 dakika içinde geri dönüş yapıyoruz." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <Icon className="text-teal-700 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Öne Çıkan İlanlar</h2>
                <Link href="/ilanlar" className="text-teal-700 hover:underline text-sm font-medium">Tümünü Gör →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Sıkça Sorulan Sorular</h2>
            <div className="space-y-4">
              {[
                { q: "Komisyon oranınız nedir?", a: "Yasal düzenlemeler çerçevesinde satış işlemlerinde %2, kiralama işlemlerinde 1 aylık kira komisyonu alınmaktadır." },
                { q: "Değerleme hizmeti veriyor musunuz?", a: "Evet, gayrimenkulünüzün piyasa değerini ücretsiz olarak belirliyoruz." },
                { q: "Tapu işlemlerinde yardımcı olur musunuz?", a: "Tapu ve noter işlemleri dahil tüm bürokratik süreçlerde yanınızdayız." },
              ].map(({ q, a }) => (
                <details key={q} className="bg-white rounded-xl border border-gray-200 p-5 group">
                  <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                    {q}
                    <span className="text-teal-700 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-gray-500 text-sm leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-teal-700 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">Gayrimenkulünüzü Satmak mı İstiyorsunuz?</h2>
            <p className="text-teal-100 mb-6">Ücretsiz değerleme için hemen arayın.</p>
            {phone && (
              <a href={`tel:${phone}`} className="inline-flex items-center gap-2 bg-white text-teal-800 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
                <Phone size={18} />{phone}
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
