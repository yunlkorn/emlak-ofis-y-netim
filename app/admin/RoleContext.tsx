"use client";

import { createContext, useContext } from "react";

type Role = "admin" | "broker" | "stajyer";

const RoleContext = createContext<Role>("stajyer");

export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}

export function useCanEdit() {
  const role = useRole();
  return role === "admin" || role === "broker";
}

export function useIsAdmin() {
  return useRole() === "admin";
}
