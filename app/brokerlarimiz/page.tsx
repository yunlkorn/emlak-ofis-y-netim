import { getBrokers } from "@/lib/db";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Phone, Mail } from "lucide-react";

export const metadata = { title: "Danışmanlarımız" };

export default async function BrokerlarimizPage() {
  const list = await getBrokers(true);
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Danışmanlarımız</h1>
        <p className="text-gray-500 mb-10">Deneyimli ekibimizle en iyi hizmeti sunmak için buradayız.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b) => (
            <div key={b.userId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-3xl text-teal-700 font-bold mb-4">
                {b.fullName.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">{b.fullName}</h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 mb-3 capitalize">
                {b.role === "admin" ? "Yönetici" : b.role === "stajyer" ? "Stajyer" : "Danışman"}
              </span>
              <div className="space-y-1 text-sm">
                <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-teal-700"><Phone size={14} />{b.phone}</a>
                <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-gray-500 hover:text-teal-700"><Mail size={14} />{b.email}</a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
