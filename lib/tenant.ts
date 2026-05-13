export function getOfficeConfig() {
  return {
    name: process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi",
    phone: process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "",
    address: process.env.NEXT_PUBLIC_OFFICE_ADDRESS ?? "",
    instagram: process.env.NEXT_PUBLIC_OFFICE_INSTAGRAM ?? "",
    brokerWhatsapp: process.env.BROKER_WHATSAPP ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    brandColor: process.env.NEXT_PUBLIC_BRAND_COLOR ?? "#0F766E",
  };
}
