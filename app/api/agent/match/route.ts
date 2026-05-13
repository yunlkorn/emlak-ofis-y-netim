import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadById, getListings } from "@/lib/db";
import { requireBrokerRole } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { buildMatchPrompt } from "@/lib/prompts/property-matcher";

const schema = z.object({ leadId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const user = await requireBrokerRole().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { leadId } = schema.parse(await req.json());
  const lead = await getLeadById(leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const activeListings = await getListings({
    status: "aktif",
    listingType: lead.listingType ?? undefined,
    limit: 30,
  });

  const { system, user: userMsg } = buildMatchPrompt(lead, activeListings);
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ result: text });
}
