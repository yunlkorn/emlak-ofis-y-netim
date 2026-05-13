import { getSessionRole } from "@/lib/getRole";
import AccessDenied from "../../AccessDenied";
import ListingForm from "../ListingForm";

export const metadata = { title: "Yeni İlan — Admin" };

export default async function YeniIlanPage() {
  const role = await getSessionRole();
  if (role === "stajyer") return <AccessDenied message="İlan ekleme yetkisine sahip değilsiniz." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Yeni İlan</h1>
      <ListingForm />
    </div>
  );
}
