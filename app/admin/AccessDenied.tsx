import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function AccessDenied({ message = "Bu sayfayı görüntüleme yetkiniz yok." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldX size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Yetkisiz Erişim</h2>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <Link href="/admin" className="text-sm text-teal-700 hover:underline">← Dashboard&apos;a Dön</Link>
    </div>
  );
}
