import { Mistral } from "@mistralai/mistralai";
import { getQuote, getCompanyProfile } from "@/lib/finnhub";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = await params;

  const [quote, profile] = await Promise.all([
    getQuote(ticker),
    getCompanyProfile(ticker),
  ]);

  const prompt = `You are a financial analyst. Analyze ${profile.name} (${ticker}).

Current Data:
- Price: $${quote.c}
- Change: ${quote.d} (${quote.dp}%)
- Today High: $${quote.h}
- Today Low: $${quote.l}
- Market Cap: $${profile.marketCapitalization}B
- Industry: ${profile.finnhubIndustry}
- Exchange: ${profile.exchange}

Provide a concise analysis covering:
1. Current price action
2. Key levels to watch
3. Overall sentiment

Keep it under 200 words. Be direct and professional.`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
  });

  return Response.json({
    analysis: response.choices[0].message.content,
  });
}