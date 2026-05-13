import { getListingById, getBrokerById, incrementViewCount } from "@/lib/db";
import { notFound } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Gallery from "@/components/Gallery";
import LeadForm from "@/components/LeadForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MapPin, Maximize2, BedDouble, Building2, Car, Sofa, Flame, Calendar } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

function formatPrice(price: string, currency: string, isKiralik: boolean) {
  const num = parseFloat(price);
  const formatted = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(num);
  return isKiralik ? `${formatted}/ay` : formatted;
}

export default async function IlanDetayPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  incrementViewCount(id, listing.viewCount ?? 0).catch(() => {});

  const broker = listing.brokerUserId ? await getBrokerById(listing.brokerUserId) : null;
  const images = listing.images as string[];
  const isKiralik = listing.listingType === "kiralik";
  const waMessage = `Merhaba, "${listing.title}" (Ref: ${listing.refNo}) ilanı hakkında bilgi almak istiyorum.`;

  const details = [
    listing.sqmNet && { label: "Net m²", value: `${listing.sqmNet} m²`, icon: Maximize2 },
    listing.sqm && { label: "Brüt m²", value: `${listing.sqm} m²`, icon: Maximize2 },
    listing.rooms && { label: "Oda", value: listing.rooms, icon: BedDouble },
    listing.floor && { label: "Kat", value: `${listing.floor}/${listing.totalFloors ?? "?"}`, icon: Building2 },
    listing.buildingAge != null && { label: "Bina Yaşı", value: `${listing.buildingAge} yıl`, icon: Calendar },
    listing.heating && { label: "Isıtma", value: listing.heating, icon: Flame },
    listing.parking != null && { label: "Otopark", value: listing.parking ? "Var" : "Yok", icon: Car },
    listing.furnished != null && { label: "Eşya", value: listing.furnished ? "Eşyalı" : "Eşyasız", icon: Sofa },
  ].filter(Boolean) as { label: string; value: string; icon: React.ElementType }[];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Gallery images={images} title={listing.title} />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isKiralik ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}`}>
                  {isKiralik ? "KİRALIK" : "SATILIK"}
                </span>
                <span className="text-xs text-gray-400">Ref: {listing.refNo}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{listing.neighborhood && `${listing.neighborhood}, `}{listing.district}, {listing.city}</span>
              </div>
              <p className="text-3xl font-bold text-teal-700 mt-4">
                {formatPrice(listing.price, listing.currency, isKiralik)}
              </p>
            </div>

            {details.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-4">İlan Detayları</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {details.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <Icon size={15} className="text-teal-600 shrink-0" />
                      <span className="text-gray-500">{label}:</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Açıklama</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <LeadForm listingId={listing.id} listingTitle={listing.title} />
            <WhatsAppButton message={waMessage} />
            {broker && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-1">Sorumlu Danışman</p>
                <p className="font-semibold text-gray-800">{broker.fullName}</p>
                <a href={`tel:${broker.phone}`} className="text-teal-700 text-sm hover:underline">{broker.phone}</a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
