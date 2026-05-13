const BASE_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "emlak-ofisi";

async function evolutionRequest(path: string, body: unknown) {
  if (!BASE_URL || !API_KEY) return;

  await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    },
    body: JSON.stringify(body),
  }).catch(console.error);
}

export async function sendWhatsApp(to: string, text: string) {
  await evolutionRequest(`/message/sendText/${INSTANCE}`, {
    number: to,
    text,
  });
}
