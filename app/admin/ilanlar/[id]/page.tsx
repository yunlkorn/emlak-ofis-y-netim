import { getListingById } from "@/lib/db";
import { getSessionRole } from "@/lib/getRole";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ListingForm from "../ListingForm";
import AccessDenied from "../../AccessDenied";

interface Props { params: Promise<{ id: string }> }

export default async function EditListingPage({ params }: Props) {
  const [{ id }, role] = await Promise.all([params, getSessionRole()]);
  if (role === "stajyer") return <AccessDenied message="İlan düzenleme yetkisine sahip değilsiniz." />;

  const listing = await getListingById(id);
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/ilanlar" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">İlanı Düzenle</h1>
      </div>
      <ListingForm listing={listing} />
    </div>
  );
}
