// supabase/functions/translate/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ContextItem = { speaker?: string; text?: string };

function extractOutputText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST 요청만 허용됩니다." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
    if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");

    const body = await req.json();
    const text = String(body?.text || "").trim().slice(0, 3000);
    const source = body?.source === "ko" ? "ko" : "en";
    const target = body?.target === "en" ? "en" : "ko";
    const style = ["natural", "literal", "simple"].includes(body?.style)
      ? body.style
      : "natural";
    const context: ContextItem[] = Array.isArray(body?.context)
      ? body.context.slice(-6)
      : [];

    if (!text) {
      return new Response(JSON.stringify({ error: "번역할 text가 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceName = source === "ko" ? "Korean" : "English";
    const targetName = target === "ko" ? "Korean" : "English";
    const styleRule =
      style === "literal"
        ? "Stay close to the source wording while remaining grammatical."
        : style === "simple"
        ? "Use short, simple, easy-to-understand travel language."
        : "Use natural, polite language suitable for travel in Hawaii.";

    const contextText = context
      .map((x) => `${String(x.speaker || "speaker")}: ${String(x.text || "").slice(0, 500)}`)
      .join("\n");

    const instructions = [
      "You are a real-time Korean-English travel interpreter.",
      `Translate from ${sourceName} to ${targetName}.`,
      styleRule,
      "Preserve names, reservation numbers, addresses, prices, dates, and times accurately.",
      "Do not explain, answer, summarize, or add commentary.",
      "Return only the translated sentence(s), with no quotation marks or labels.",
      "Use recent conversation context only to resolve pronouns or ambiguity.",
    ].join(" ");

    const input = contextText
      ? `Recent conversation:\n${contextText}\n\nText to translate:\n${text}`
      : `Text to translate:\n${text}`;

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: 300,
      }),
    });

    const data = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error("OpenAI error", data);
      throw new Error(data?.error?.message || "OpenAI API 요청 실패");
    }

    const translatedText = extractOutputText(data);
    if (!translatedText) throw new Error("GPT 통역 결과가 없습니다.");

    return new Response(
      JSON.stringify({ translatedText, model }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "GPT 통역 처리 실패",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
