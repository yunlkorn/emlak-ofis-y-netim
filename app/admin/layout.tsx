import { redirect } from "next/navigation";
import { requireBrokerRole } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, ListFilter, Users, Settings, Home, Building2 } from "lucide-react";
import { RoleProvider } from "./RoleContext";

type Role = "admin" | "broker" | "stajyer";

const allNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, minRole: "stajyer" as Role },
  { href: "/admin/ilanlar", label: "İlanlar", icon: Building2, minRole: "stajyer" as Role },
  { href: "/admin/leads", label: "Lead'ler", icon: Users, minRole: "stajyer" as Role },
  { href: "/admin/brokerlar", label: "Danışmanlar", icon: ListFilter, minRole: "admin" as Role },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings, minRole: "admin" as Role },
];

const roleLevel: Record<Role, number> = { stajyer: 0, broker: 1, admin: 2 };

function canSee(userRole: Role, minRole: Role) {
  return roleLevel[userRole] >= roleLevel[minRole];
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await requireBrokerRole(["admin", "broker", "stajyer"]).catch(() => null);
  if (!result) redirect("/giris?redirect=/admin");

  const role = result.broker.role as Role;
  const nav = allNav.filter((item) => canSee(role, item.minRole));

  return (
    <RoleProvider role={role}>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <Home size={16} />
              {process.env.NEXT_PUBLIC_OFFICE_NAME ?? "Emlak Ofisi"}
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-colors font-medium">
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{result.broker.fullName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              role === "admin" ? "bg-purple-100 text-purple-700" :
              role === "stajyer" ? "bg-gray-100 text-gray-500" :
              "bg-teal-100 text-teal-700"
            }`}>
              {role === "admin" ? "Admin" : role === "stajyer" ? "Stajyer" : "Danışman"}
            </span>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </RoleProvider>
  );
}
