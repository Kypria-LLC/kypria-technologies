import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://kypriatechnologies.org";

// Store the mapped persona, not the raw quiz archetype key: leads.persona_result
// is constrained to zeus / aphrodite / lifesphere / NULL (leads_persona_result_check)
// and the funnel contract defines this column as the stored persona layer.
// Mirror of demos/mythic-persona-quiz ARCHETYPE_TO_PERSONA — keep in sync.
const ARCHETYPE_TO_PERSONA: Record<string, string> = {
  architect: "zeus",
  visionary: "zeus",
  executor: "zeus",
  analyst: "lifesphere",
  curator: "lifesphere",
  synthesizer: "aphrodite",
};

function cors(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
  };
}

function str(v: unknown, max = 256): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors(origin) });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: cors(origin) });
  }

  const email = (str(body.email, 254) ?? "").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "invalid email" }), { status: 400, headers: cors(origin) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supabase
    .from("leads")
    .insert({
      source: "quiz",
      email,
      persona_result: ARCHETYPE_TO_PERSONA[str(body.archetype, 64) ?? ""] ?? null,
      utm_source: str(body.utm_source, 128),
      utm_medium: str(body.utm_medium, 128),
      utm_campaign: str(body.utm_campaign, 128),
      utm_content: str(body.utm_content, 128),
      utm_term: str(body.utm_term, 128),
      referrer: str(body.referrer, 512),
      landing_path: str(body.landing_path, 512),
      notes: "captured via capture-lead edge function",
    })
    .select("id")
    .single();

  if (error) {
    console.error("leads insert failed:", error.message);
    return new Response(JSON.stringify({ error: "insert failed" }), { status: 500, headers: cors(origin) });
  }
  return new Response(JSON.stringify({ ok: true, lead_id: data.id }), { status: 200, headers: cors(origin) });
});
