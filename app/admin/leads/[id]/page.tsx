import { getLeadById, getInteractions, getBrokers } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react";
import LeadStatusForm from "./LeadStatusForm";
import AddInteractionForm from "./AddInteractionForm";

interface Props { params: Promise<{ id: string }> }

export default async function LeadDetailPage({ params }: Props) {
  const [{ id }, role] = await Promise.all([params, getSessionRole()]);
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const [interactions, brokerList] = await Promise.all([
    getInteractions(id),
    getBrokers(true),
  ]);

  const canEdit = role === "admin" || role === "broker";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/leads" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">{lead.fullName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Lead Bilgileri</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Telefon", lead.phone],
                ["E-posta", lead.email ?? "—"],
                ["Kaynak", lead.source],
                ["İlan Tipi", lead.listingType ?? "—"],
                ["Mülk Tipi", lead.propertyType ?? "—"],
                ["İlçe", lead.district ?? "—"],
                ["Min Bütçe", lead.budgetMin ? `₺${parseInt(lead.budgetMin).toLocaleString("tr-TR")}` : "—"],
                ["Max Bütçe", lead.budgetMax ? `₺${parseInt(lead.budgetMax).toLocaleString("tr-TR")}` : "—"],
                ["Oda Tercihi", lead.roomsPreference ?? "—"],
                ["Oluşturulma", new Date(lead.createdAt).toLocaleString("tr-TR")],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-gray-400">{k}</dt><dd className="font-medium text-gray-800">{v}</dd></div>
              ))}
            </dl>
            {lead.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Notlar</p>
                <p className="text-sm text-gray-700">{lead.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">İletişim Geçmişi</h2>
            {interactions.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz etkileşim yok.</p>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-4 pl-5">
                {interactions.map((i) => (
                  <li key={i.id} className="relative">
                    <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-teal-600 border-2 border-white" />
                    <p className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleString("tr-TR")} · {i.channel} · {i.direction}</p>
                    {i.content && <p className="text-sm text-gray-700 mt-1">{i.content}</p>}
                  </li>
                ))}
              </ol>
            )}
            {canEdit && <AddInteractionForm leadId={id} />}
          </div>
        </div>

        <div className="space-y-4">
          <LeadStatusForm lead={lead} brokers={brokerList} canEdit={canEdit} />
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
            <h2 className="font-semibold text-gray-800 mb-2">Hızlı Bağlantı</h2>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700"><Phone size={14} />{lead.phone}</a>
            {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700"><Mail size={14} />{lead.email}</a>}
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"><MessageCircle size={14} />WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
