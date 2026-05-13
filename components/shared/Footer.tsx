import Link from "next/link";
import { Phone, MapPin, Instagram } from "lucide-react";

export default function Footer() {
  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi";
  const phone = process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "";
  const address = process.env.NEXT_PUBLIC_OFFICE_ADDRESS ?? "";
  const instagram = process.env.NEXT_PUBLIC_OFFICE_INSTAGRAM ?? "";

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{officeName}</h3>
            <p className="text-sm leading-relaxed">
              Güvenilir emlak danışmanınız. İstanbul&apos;un en değerli lokasyonlarında satılık ve kiralık ilanlar.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ilanlar?tip=satilik" className="hover:text-white transition-colors">Satılık İlanlar</Link></li>
              <li><Link href="/ilanlar?tip=kiralik" className="hover:text-white transition-colors">Kiralık İlanlar</Link></li>
              <li><Link href="/brokerlarimiz" className="hover:text-white transition-colors">Danışmanlarımız</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">İletişim</h4>
            <ul className="space-y-2 text-sm">
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {instagram && (
                <li className="flex items-center gap-2">
                  <Instagram size={14} />
                  <a href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">{instagram}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {officeName}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
