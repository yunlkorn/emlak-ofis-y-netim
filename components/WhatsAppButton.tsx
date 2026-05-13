"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({
  phone,
  message,
  label = "WhatsApp ile İletişim",
}: {
  phone?: string;
  message?: string;
  label?: string;
}) {
  const target = phone ?? process.env.NEXT_PUBLIC_OFFICE_PHONE ?? "";
  const normalized = target.replace(/\D/g, "");
  const text = encodeURIComponent(message ?? "Merhaba, ilan hakkında bilgi almak istiyorum.");
  const href = `https://wa.me/${normalized}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-5 rounded-xl transition-colors w-full"
    >
      <MessageCircle size={20} />
      {label}
    </a>
  );
}
