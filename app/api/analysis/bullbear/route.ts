import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function POST(req: Request) {
  try {
    const { ticker, price } = await req.json();

    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: `Give a 2-3 sentence bull case AND bear case for ${ticker} at $${price}. 
          Reply in JSON exactly like: {"bull": "...", "bear": "..."}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((chunk) => ("text" in chunk ? chunk.text : "")).join("")
          : "{}";

    try {
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      return Response.json(json);
    } catch {
      return Response.json({ bull: text, bear: "" });
    }
  } catch (error) {
    console.error("Bullbear error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}