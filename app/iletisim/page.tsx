import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import LeadForm from "@/components/LeadForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Phone, MapPin, Instagram, Clock } from "lucide-react";

export const metadata = { title: "İletişim" };

export default function IletisimPage() {
  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi";
  const phone = process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "";
  const address = process.env.NEXT_PUBLIC_OFFICE_ADDRESS ?? "";
  const instagram = process.env.NEXT_PUBLIC_OFFICE_INSTAGRAM ?? "";

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">İletişim</h1>
        <p className="text-gray-500 mb-10">Bizimle iletişime geçin, en kısa sürede size dönelim.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg mb-4">{officeName}</h2>
              <ul className="space-y-3 text-gray-600">
                {phone && (
                  <li className="flex items-center gap-3">
                    <Phone size={18} className="text-teal-700 shrink-0" />
                    <a href={`tel:${phone}`} className="hover:text-teal-700">{phone}</a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="text-teal-700 shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </li>
                )}
                {instagram && (
                  <li className="flex items-center gap-3">
                    <Instagram size={18} className="text-teal-700 shrink-0" />
                    <a href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">{instagram}</a>
                  </li>
                )}
                <li className="flex items-center gap-3">
                  <Clock size={18} className="text-teal-700 shrink-0" />
                  <span>Pzt–Cmt: 09:00 – 19:00</span>
                </li>
              </ul>
            </div>
            <WhatsAppButton label="WhatsApp ile Yazın" />
          </div>
          <LeadForm listingTitle="" />
        </div>
      </main>
      <Footer />
    </>
  );
}
