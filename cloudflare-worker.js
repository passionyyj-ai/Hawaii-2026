export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-App-Key",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST 요청만 허용됩니다." }, 405, cors);

    try {
      if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY Secret이 없습니다.");
      if (env.APP_ACCESS_KEY && request.headers.get("X-App-Key") !== env.APP_ACCESS_KEY) {
        return json({ error: "앱 접근 키가 올바르지 않습니다." }, 401, cors);
      }
      const body = await request.json();
      const mode = body.mode || "translate";
      let payload;

      if (mode === "vision") {
        const image = String(body.image || "");
        if (!image.startsWith("data:image/")) return json({ error: "이미지 데이터가 필요합니다." }, 400, cors);
        payload = {
          model: env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
          instructions: "You are a Korean travel assistant in Hawaii. Read the image carefully. Translate visible English into Korean, summarize prices, conditions, warnings, allergens, fees, dates and times. Never invent unreadable text. Clearly say '확인 불가' for uncertain content. Respond in Korean with compact headings.",
          input: [{
            role: "user",
            content: [
              { type: "input_text", text: "이 메뉴판, 표지판, 영수증 또는 여행 관련 사진을 분석하고 한국어로 설명해줘." },
              { type: "input_image", image_url: image }
            ]
          }],
          max_output_tokens: 700
        };
      } else if (mode === "assistant") {
        const text = String(body.text || "").trim().slice(0, 3000);
        if (!text) return json({ error: "상황 설명이 필요합니다." }, 400, cors);
        payload = {
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: `You are a practical Korean travel assistant for a Hawaii trip.
Return valid JSON only, with keys:
summary: concise Korean explanation of the situation,
english: one or more natural, polite English sentences the traveler can say immediately,
actions: array of 2 to 4 concise Korean next-step suggestions.
Preserve names, prices, dates, times and reservation details. Do not invent facts.`,
          input: text,
          max_output_tokens: 500,
          text: { format: { type: "json_object" } }
        };
      } else {
        const text = String(body.text || "").trim().slice(0, 3000);
        const source = body.source === "ko" ? "Korean" : "English";
        const target = body.target === "en" ? "English" : "Korean";
        const style = body.style === "literal" ? "close to the source" : body.style === "simple" ? "short and simple" : "natural and polite";
        const context = Array.isArray(body.context) ? body.context.slice(-6) : [];
        payload = {
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: `You are a real-time Korean-English travel interpreter. Translate from ${source} to ${target}. Use ${style} language. Preserve names, numbers, prices, addresses, dates and times. Use context only to resolve ambiguity. Return only the translation.`,
          input: `${context.length ? "Recent context:\n"+context.map(x=>`${x.speaker||"speaker"}: ${x.text||""}`).join("\n")+"\n\n" : ""}Text:\n${text}`,
          max_output_tokens: 300
        };
      }

      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "OpenAI API 요청 실패");
      const output = extractText(data);

      if (mode === "assistant") {
        let parsed;
        try { parsed = JSON.parse(output); } catch { parsed = { summary: output, english: "", actions: [] }; }
        return json(parsed, 200, cors);
      }
      if (mode === "vision") return json({ result: output }, 200, cors);
      return json({ translatedText: output }, 200, cors);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "처리 실패" }, 500, cors);
    }
  }
};

function extractText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();
  const parts = [];
  for (const item of data?.output || []) {
    for (const c of item?.content || []) if (typeof c?.text === "string") parts.push(c.text);
  }
  return parts.join("\n").trim();
}
function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" }
  });
}
