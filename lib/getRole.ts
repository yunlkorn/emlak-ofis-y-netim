import { createClient } from "./supabase/server";
import { getBrokerById } from "./db";

type Role = "admin" | "broker" | "stajyer";

export async function getSessionRole(): Promise<Role | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const broker = await getBrokerById(user.id);
  if (!broker || !broker.isActive) return null;
  return broker.role as Role;
}
