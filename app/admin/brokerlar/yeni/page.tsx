import BrokerForm from "../BrokerForm";

export const metadata = { title: "Yeni Danışman — Admin" };

export default function YeniDanismanPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800">Yeni Danışman Ekle</h1>
      <BrokerForm />
    </div>
  );
}
