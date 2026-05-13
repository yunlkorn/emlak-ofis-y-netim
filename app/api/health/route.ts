import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = createAdminClient();
    const { error } = await sb.from("listings").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
