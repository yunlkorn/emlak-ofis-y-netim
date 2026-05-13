import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi",
    template: `%s | ${process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi"}`,
  },
  description: "Güvenilir emlak danışmanınız. Satılık ve kiralık ilanlar.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
