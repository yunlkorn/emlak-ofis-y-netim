export const dynamic = "force-dynamic";

import { getListings } from "@/lib/db";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ tip?: string; tur?: string; ilce?: string; minFiyat?: string; maxFiyat?: string; sayfa?: string }>;
}

export const metadata = { title: "İlanlar" };

async function ListingsGrid({ sp }: { sp: Awaited<Props["searchParams"]> }) {
  const page = Math.max(1, parseInt(sp.sayfa ?? "1"));
  const results = await getListings({
    status: "aktif",
    listingType: sp.tip,
    propertyType: sp.tur,
    district: sp.ilce,
    minPrice: sp.minFiyat,
    maxPrice: sp.maxFiyat,
    limit: 12,
    offset: (page - 1) * 12,
  });

  if (!results.length) return <p className="text-center text-gray-400 py-16">Kriterlere uygun ilan bulunamadı.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

export default async function IlanlarPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">İlanlar</h1>
        <div className="mb-6">
          <Suspense><SearchFilters /></Suspense>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        }>
          <ListingsGrid sp={sp} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
