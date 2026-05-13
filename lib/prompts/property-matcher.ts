import type { Lead, Listing } from "@/lib/schema";

export const PROPERTY_MATCHER_SYSTEM = `Sen bir emlak asistanısın. Müşteri profiline bakarak uygun ilanları eşleştirirsin.

Öncelik sırası:
- listingType (satılık/kiralık) zorunlu eşleşme
- district zorunlu (listede yoksa en yakını)
- budget %10 esneklik
- oda ±1 esneklik

Çıktı SADECE JSON:
{
  "matches": [{ "listingId": "uuid", "matchReason": "...", "matchScore": 0.95 }],
  "missingInfo": []
}

Uygun ilan yoksa boş matches, missingInfo'ya öneri yaz. Sadece JSON döndür.`;

export function buildMatchPrompt(lead: Lead, activeListings: Listing[]) {
  const listingsSummary = activeListings.map(l => ({
    id: l.id,
    title: l.title,
    listingType: l.listingType,
    propertyType: l.propertyType,
    district: l.district,
    price: l.price,
    currency: l.currency,
    rooms: l.rooms,
    sqmNet: l.sqmNet,
  }));

  return {
    system: PROPERTY_MATCHER_SYSTEM,
    user: `Müşteri profili:
Ad: ${lead.fullName}
İlan tipi: ${lead.listingType ?? "belirtilmemiş"}
Mülk tipi: ${lead.propertyType ?? "belirtilmemiş"}
İlçe tercihi: ${lead.district ?? "belirtilmemiş"}
Bütçe: ${lead.budgetMin ? `₺${lead.budgetMin}` : "—"} - ${lead.budgetMax ? `₺${lead.budgetMax}` : "—"}
Oda: ${lead.roomsPreference ?? "belirtilmemiş"}
Not: ${lead.notes ?? "—"}

Mevcut ilanlar:
${JSON.stringify(listingsSummary, null, 2)}`,
  };
}
