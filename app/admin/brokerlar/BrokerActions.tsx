"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Broker } from "@/lib/schema";

type Role = "admin" | "broker" | "stajyer";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  broker: "Danışman",
  stajyer: "Stajyer",
};

export default function BrokerActions({ broker }: { broker: Broker }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>(broker.role as Role);

  async function patch(data: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${broker.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { alert(json.error); return false; }
    router.refresh();
    return true;
  }

  async function changeRole(newRole: Role) {
    setRole(newRole);
    await patch({ role: newRole });
  }

  async function toggleActive() {
    await patch({ isActive: !broker.isActive });
  }

  async function deleteUser() {
    if (!confirm(`"${broker.fullName}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${broker.userId}`, { method: "DELETE" });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { alert(json.error); return; }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {/* Rol seçici */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Yetki Seviyesi</label>
        <div className="flex gap-1">
          {(["stajyer", "broker", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              disabled={loading}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 ${
                role === r
                  ? r === "admin"
                    ? "bg-purple-600 text-white"
                    : r === "broker"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Aktif/Pasif + Sil */}
      <div className="flex gap-2">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 ${
            broker.isActive
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
          }`}
        >
          {broker.isActive ? "Pasif Yap" : "Aktif Et"}
        </button>
        <button
          onClick={deleteUser}
          disabled={loading}
          className="flex-1 text-xs py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
