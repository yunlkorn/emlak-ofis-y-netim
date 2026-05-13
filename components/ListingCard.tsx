import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize2, BedDouble } from "lucide-react";
import type { Listing } from "@/lib/schema";

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price);
  if (currency === "TRY") {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(num);
  }
  return `${num.toLocaleString("tr-TR")} ${currency}`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const images = listing.images as string[];
  const thumb = images?.[0] ?? null;
  const isKiralik = listing.listingType === "kiralik";

  return (
    <Link href={`/ilan/${listing.id}`} className="group block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative h-52 bg-gray-100">
        {thumb ? (
          <Image src={thumb} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300 text-4xl">🏠</div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${isKiralik ? "bg-blue-600 text-white" : "bg-teal-700 text-white"}`}>
          {isKiralik ? "KİRALIK" : "SATILIK"}
        </span>
        {listing.isFeatured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400 text-amber-900">
            ÖNE ÇIKAN
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">Ref: {listing.refNo}</p>
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={13} />
          <span>{listing.district}, {listing.city}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {listing.sqmNet && (
            <span className="flex items-center gap-1"><Maximize2 size={13} />{listing.sqmNet} m²</span>
          )}
          {listing.rooms && (
            <span className="flex items-center gap-1"><BedDouble size={13} />{listing.rooms}</span>
          )}
        </div>
        <p className="text-teal-700 font-bold text-lg">
          {formatPrice(listing.price, listing.currency)}
          {isKiralik && <span className="text-sm font-normal text-gray-500">/ay</span>}
        </p>
      </div>
    </Link>
  );
}
