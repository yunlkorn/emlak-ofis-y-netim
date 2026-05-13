import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getBrokerById } from "./db";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/giris");
  return user;
}

export async function requireBrokerRole(
  allowedRoles: ("admin" | "broker" | "stajyer")[] = ["admin", "broker"]
) {
  const user = await requireUser();

  const broker = await getBrokerById(user.id);

  if (!broker || !allowedRoles.includes(broker.role)) {
    redirect("/");
  }

  return { user, broker };
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
