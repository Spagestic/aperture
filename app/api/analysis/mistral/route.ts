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
          content: `You are a financial analyst. Give a concise analysis of ${ticker} currently trading at $${price}.

Cover:
1. **Current Price Action**: What the price movement indicates
2. **Key Levels to Watch**: Support and resistance levels
3. **Overall Sentiment**: Bullish, bearish, or neutral with reasoning
4. **Bottom Line**: One sentence summary

Include a sentiment score like "Sentiment: 65" (0=very bearish, 100=very bullish) at the end.
Keep it under 200 words.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const analysis =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((chunk) => ("text" in chunk ? chunk.text : "")).join("")
          : "";
    return Response.json({ analysis });
  } catch (error) {
    console.error("Mistral error:", error);
    return Response.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}