/**
 * Sahibinden.com scraper — önizleme modunda çalışır.
 * Admin onayı sonrası /api/listings/import ile DB'ye yazılır.
 *
 * Kullanım:
 *   pnpm tsx scripts/sahibinden-scraper.ts \
 *     --il=Istanbul --ilce=Atasehir --minFiyat=3000000 --maxFiyat=8000000
 *
 * NOT: sahibinden.com'un kullanım koşullarına uygun olarak kendi ilanlarınızı
 * veya izin verilen erişim yöntemlerini kullanın.
 */

// Gerekli paket: pnpm add -D node-fetch cheerio @types/cheerio
// Bu script placeholder implementasyondur — gerçek scraping için
// HTTP client + HTML parser ile doldurulmalıdır.

interface ScraperFilters {
  il?: string;
  ilce?: string;
  mahalle?: string;
  minFiyat?: number;
  maxFiyat?: number;
  odaSayisi?: string;
  ilanTipi?: "satilik" | "kiralik";
}

export interface ScrapedListing {
  externalId: string;
  title:       string;
  price:       number;
  district:    string;
  city:        string;
  neighborhood?: string;
  rooms?:      string;
  sqm?:        number;
  url:         string;
  imageUrl?:   string;
  source:      "sahibinden";
}

/** URL builder for sahibinden.com search */
function buildSahibindenUrl(filters: ScraperFilters): string {
  const base = "https://www.sahibinden.com";
  const type = filters.ilanTipi === "kiralik" ? "kiralik-konut" : "satilik-konut";
  const params = new URLSearchParams();
  if (filters.il)       params.set("city",        filters.il);
  if (filters.ilce)     params.set("town",         filters.ilce);
  if (filters.mahalle)  params.set("district",     filters.mahalle);
  if (filters.minFiyat) params.set("price_min",    filters.minFiyat.toString());
  if (filters.maxFiyat) params.set("price_max",    filters.maxFiyat.toString());
  if (filters.odaSayisi)params.set("room_count",   filters.odaSayisi);
  return `${base}/${type}?${params.toString()}`;
}

/**
 * Scraper ana fonksiyonu.
 * Gerçek implementasyon için:
 *   1. HTTP isteği at (fetch veya puppeteer)
 *   2. HTML'i parse et (cheerio)
 *   3. İlan kartlarını çek
 *   4. externalId ile duplicate kontrolü yap
 */
export async function scrapeListings(filters: ScraperFilters): Promise<ScrapedListing[]> {
  const url = buildSahibindenUrl(filters);
  console.log(`Scraping URL: ${url}`);

  // ── PLACEHOLDER ─────────────────────────────────────────────────────────────
  // Gerçek implementasyon buraya gelecek. Örnek yapı:
  //
  // const res  = await fetch(url, { headers: { "User-Agent": "..." } });
  // const html = await res.text();
  // const $    = cheerio.load(html);
  // const results: ScrapedListing[] = [];
  //
  // $(".classifiedList .searchResultsItem").each((_, el) => {
  //   const id    = $(el).attr("data-id") ?? "";
  //   const title = $(el).find("h3.classifiedTitle").text().trim();
  //   const price = parseInt($(el).find(".price").text().replace(/\D/g,"")) || 0;
  //   ...
  //   results.push({ externalId: id, title, price, ... source: "sahibinden" });
  // });
  //
  // return results;
  // ────────────────────────────────────────────────────────────────────────────

  console.log("⚠️  Scraper placeholder modunda — gerçek HTML parsing eklenmeli.");
  return [];
}

/** Duplicate kontrolü: externalId mevcut mu */
export async function filterNewListings(
  items: ScrapedListing[],
  existingIds: Set<string>
): Promise<ScrapedListing[]> {
  return items.filter((item) => !existingIds.has(item.externalId));
}

// CLI çalıştırma
if (require.main === module) {
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v] = a.slice(2).split("=");
        return [k, v];
      })
  );

  const filters: ScraperFilters = {
    il:        args.il,
    ilce:      args.ilce,
    mahalle:   args.mahalle,
    minFiyat:  args.minFiyat  ? parseInt(args.minFiyat)  : undefined,
    maxFiyat:  args.maxFiyat  ? parseInt(args.maxFiyat)  : undefined,
    odaSayisi: args.odaSayisi,
    ilanTipi:  (args.ilanTipi as "satilik" | "kiralik") ?? "satilik",
  };

  scrapeListings(filters).then((results) => {
    console.log(`\n${results.length} ilan bulundu:\n`);
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      console.log(`   ID: ${r.externalId} | ${r.price.toLocaleString("tr-TR")} ₺ | ${r.district}`);
    });
    console.log("\nOnaylamak için: POST /api/listings/import");
  });
}
