import { getSessionRole } from "@/lib/getRole";
import AccessDenied from "../AccessDenied";

export const metadata = { title: "Ayarlar — Admin" };

export default async function AyarlarPage() {
  const role = await getSessionRole();
  if (role !== "admin") return <AccessDenied message="Ayarlar sadece adminlere açıktır." />;

  const vars = [
    ["NEXT_PUBLIC_OFFICE_NAME", process.env.NEXT_PUBLIC_OFFICE_NAME],
    ["NEXT_PUBLIC_OFFICE_PHONE", process.env.NEXT_PUBLIC_OFFICE_PHONE],
    ["NEXT_PUBLIC_OFFICE_ADDRESS", process.env.NEXT_PUBLIC_OFFICE_ADDRESS],
    ["NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL],
    ["EVOLUTION_INSTANCE", process.env.EVOLUTION_INSTANCE],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ayarlar</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Ortam Değişkenleri</h2>
        <dl className="space-y-3 text-sm">
          {vars.map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <dt className="text-gray-400 font-mono w-64 shrink-0">{k}</dt>
              <dd className="text-gray-800 font-medium">{v ?? <span className="text-red-400">— ayarlanmamış</span>}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-gray-400">Değerleri değiştirmek için .env.local dosyasını düzenleyin ve sunucuyu yeniden başlatın.</p>
      </div>
    </div>
  );
}
