"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const nav = [
  { href: "/ilanlar", label: "İlanlar" },
  { href: "/brokerlarimiz", label: "Danışmanlarımız" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi";
  const phone = process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-teal-700">
            {officeName}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-teal-700 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors text-sm font-medium"
              >
                <Phone size={16} />
                {phone}
              </a>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menü"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-700 hover:text-teal-700 font-medium py-1"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-teal-700 font-medium py-1"
            >
              <Phone size={16} />
              {phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
