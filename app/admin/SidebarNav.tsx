"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, BarChart3,
  Settings, Home, Kanban, UserCheck, LogOut,
} from "lucide-react";

type Role = "admin" | "broker" | "stajyer";

const allNav = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard, minRole: "stajyer" as Role, exact: true },
  { href: "/admin/pipeline",  label: "Pipeline",    icon: Kanban,           minRole: "stajyer" as Role },
  { href: "/admin/leads",     label: "Lead'ler",    icon: Users,            minRole: "stajyer" as Role },
  { href: "/admin/ilanlar",   label: "İlanlar",     icon: Building2,        minRole: "stajyer" as Role },
  { href: "/admin/danismanlar", label: "Danışmanlar", icon: UserCheck,        minRole: "admin"   as Role },
  { href: "/admin/raporlar",  label: "Raporlar",    icon: BarChart3,        minRole: "broker"  as Role },
  { href: "/admin/ayarlar",   label: "Ayarlar",     icon: Settings,         minRole: "admin"   as Role },
];

const roleLevel: Record<Role, number> = { stajyer: 0, broker: 1, admin: 2 };

interface Props {
  role: Role;
  brokerName: string;
  officeName: string;
}

export default function SidebarNav({ role, brokerName, officeName }: Props) {
  const pathname = usePathname();
  const nav = allNav.filter((item) => roleLevel[role] >= roleLevel[item.minRole]);

  return (
    <aside
      className="w-60 shrink-0 flex flex-col min-h-screen sticky top-0"
      style={{ background: "var(--c-sidebar)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--c-brand)" }}
          >
            <Home size={14} className="text-white" />
          </div>
          <span
            className="font-bold text-white text-sm leading-tight truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {officeName}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: active ? "oklch(80% 0.12 38)" : "var(--c-sidebar-text)",
                background: active ? "oklch(56% 0.20 38 / 0.18)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ background: "var(--c-brand)" }}
          >
            {brokerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{brokerName}</p>
            <p className="text-xs" style={{ color: "var(--c-sidebar-text)", opacity: 0.5 }}>
              {role === "admin" ? "Admin" : role === "stajyer" ? "Stajyer" : "Danışman"}
            </p>
          </div>
          <Link
            href="/giris"
            className="opacity-40 hover:opacity-80 transition-opacity text-white"
            title="Çıkış"
          >
            <LogOut size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
