import { redirect } from "next/navigation";
import { requireBrokerRole } from "@/lib/auth";
import { RoleProvider } from "./RoleContext";
import SidebarNav from "./SidebarNav";

type Role = "admin" | "broker" | "stajyer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await requireBrokerRole(["admin", "broker", "stajyer"]).catch(() => null);
  if (!result) redirect("/giris?redirect=/admin");

  const role       = result.broker.role as Role;
  const officeName = process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak CRM";

  return (
    <RoleProvider role={role}>
      <div className="flex min-h-screen" style={{ background: "var(--c-bg)" }}>
        <SidebarNav role={role} brokerName={result.broker.fullName} officeName={officeName} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </RoleProvider>
  );
}
