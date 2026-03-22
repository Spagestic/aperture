import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

/** Optional display metadata for the companies table */
const COMPANY_META: Record<
  string,
  {
    sector: string;
    country: string;
    industry?: string;
    currency: string;
    listedBoard: string;
    description?: string;
  }
> = {
  "0700.HK": {
    sector: "Technology",
    country: "China",
    industry: "Internet & software",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Internet platforms, gaming, fintech, and cloud in China.",
  },
  "9988.HK": {
    sector: "Consumer Discretionary",
    country: "China",
    industry: "E-commerce & retail",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "E-commerce, cloud, digital media, and local services.",
  },
  "3690.HK": {
    sector: "Consumer Discretionary",
    country: "China",
    industry: "Internet services",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Local services, in-store retail, and food delivery.",
  },
  "0941.HK": {
    sector: "Communication Services",
    country: "China",
    industry: "Telecom",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Mobile telecommunications operator in Mainland China and Hong Kong.",
  },
  "0005.HK": {
    sector: "Financials",
    country: "United Kingdom",
    industry: "Diversified banks",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Global banking and wealth management with HK listing.",
  },
  "1299.HK": {
    sector: "Financials",
    country: "Hong Kong",
    industry: "Life insurance",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Pan-Asian life insurance and asset management.",
  },
  "0883.HK": {
    sector: "Energy",
    country: "China",
    industry: "Oil & gas",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Upstream oil and gas exploration and production.",
  },
  "0388.HK": {
    sector: "Financials",
    country: "Hong Kong",
    industry: "Exchange & clearing",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Hong Kong securities and derivatives exchange operator.",
  },
  "0001.HK": {
    sector: "Conglomerates",
    country: "Hong Kong",
    industry: "Multi-sector holdings",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Ports, retail, infrastructure, and telecommunications.",
  },
  "0823.HK": {
    sector: "Real Estate",
    country: "Hong Kong",
    industry: "REIT",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Hong Kong retail and commercial property REIT.",
  },
  "2318.HK": {
    sector: "Financials",
    country: "China",
    industry: "Insurance",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Integrated financial services and insurance in China.",
  },
  "1211.HK": {
    sector: "Consumer Discretionary",
    country: "China",
    industry: "Automobiles",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "EV and auto manufacturing with global footprint.",
  },
  "0016.HK": {
    sector: "Real Estate",
    country: "Hong Kong",
    industry: "Property development",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Hong Kong property development and investment.",
  },
  "0002.HK": {
    sector: "Utilities",
    country: "Hong Kong",
    industry: "Electric utility",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Electricity generation and supply in Hong Kong.",
  },
  "0003.HK": {
    sector: "Utilities",
    country: "Hong Kong",
    industry: "Gas utility",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Town gas production and distribution in Hong Kong.",
  },
  "0011.HK": {
    sector: "Financials",
    country: "Hong Kong",
    industry: "Banks",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Retail and commercial banking in Hong Kong and Greater Bay Area.",
  },
  "0066.HK": {
    sector: "Industrials",
    country: "Hong Kong",
    industry: "Rail transport",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Hong Kong rail network and related property development.",
  },
  "1093.HK": {
    sector: "Health Care",
    country: "China",
    industry: "Pharmaceuticals",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Innovation-focused pharmaceutical group in China.",
  },
  "0267.HK": {
    sector: "Financials",
    country: "China",
    industry: "Conglomerate",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Financial services, industrials, and resources in China.",
  },
  "0175.HK": {
    sector: "Consumer Discretionary",
    country: "China",
    industry: "Automobiles",
    currency: "HKD",
    listedBoard: "Main Board",
    description: "Automobile manufacturing and mobility brands.",
  },
};

const TOP_HKEX_COMPANIES = [
  {
    ticker: "0700.HK",
    name: "Tencent Holdings",
    websiteUrl: "https://www.tencent.com",
  },
  {
    ticker: "9988.HK",
    name: "Alibaba Group",
    websiteUrl: "https://www.alibabagroup.com",
  },
  {
    ticker: "3690.HK",
    name: "Meituan",
    websiteUrl: "https://about.meituan.com",
  },
  {
    ticker: "0941.HK",
    name: "China Mobile",
    websiteUrl: "https://www.chinamobileltd.com",
  },
  {
    ticker: "0005.HK",
    name: "HSBC Holdings",
    websiteUrl: "https://www.hsbc.com",
  },
  { ticker: "1299.HK", name: "AIA Group", websiteUrl: "https://www.aia.com" },
  { ticker: "0883.HK", name: "CNOOC", websiteUrl: "https://www.cnoocltd.com" },
  { ticker: "0388.HK", name: "HKEX", websiteUrl: "https://www.hkexgroup.com" },
  {
    ticker: "0001.HK",
    name: "CK Hutchison",
    websiteUrl: "https://www.ckh.com.hk",
  },
  {
    ticker: "0823.HK",
    name: "Link REIT",
    websiteUrl: "https://www.linkreit.com",
  },
  {
    ticker: "2318.HK",
    name: "Ping An Insurance",
    websiteUrl: "https://group.pingan.com",
  },
  { ticker: "1211.HK", name: "BYD", websiteUrl: "https://www.bydglobal.com" },
  {
    ticker: "0016.HK",
    name: "Sun Hung Kai Properties",
    websiteUrl: "https://www.shkp.com",
  },
  {
    ticker: "0002.HK",
    name: "CLP Holdings",
    websiteUrl: "https://www.clpgroup.com",
  },
  {
    ticker: "0003.HK",
    name: "Hong Kong and China Gas",
    websiteUrl: "https://www.towngas.com",
  },
  {
    ticker: "0011.HK",
    name: "Hang Seng Bank",
    websiteUrl: "https://www.hangseng.com",
  },
  {
    ticker: "0066.HK",
    name: "MTR Corporation",
    websiteUrl: "https://www.mtr.com.hk",
  },
  {
    ticker: "1093.HK",
    name: "CSPC Pharmaceutical",
    websiteUrl: "https://www.cspc.com.hk",
  },
  {
    ticker: "0267.HK",
    name: "CITIC Limited",
    websiteUrl: "https://www.citic.com",
  },
  {
    ticker: "0175.HK",
    name: "Geely Automobile",
    websiteUrl: "http://www.geelyauto.com.hk",
  },
];

function metaToCompanyFields(
  meta: (typeof COMPANY_META)[string] | undefined,
): Record<string, string> {
  if (!meta) {
    return {};
  }
  const entries = {
    country: meta.country,
    sector: meta.sector,
    industry: meta.industry,
    currency: meta.currency,
    listedBoard: meta.listedBoard,
    description: meta.description,
  };
  return Object.fromEntries(
    Object.entries(entries).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
}

async function main() {
  console.log(
    `Seeding ${TOP_HKEX_COMPANIES.length} top HKEX companies to Convex...`,
  );

  for (let i = 0; i < TOP_HKEX_COMPANIES.length; i++) {
    const company = TOP_HKEX_COMPANIES[i];

    console.log(
      `Processing ${i + 1}/${TOP_HKEX_COMPANIES.length}: ${company.ticker} - ${company.name}`,
    );

    try {
      const meta = COMPANY_META[company.ticker];
      const extra = metaToCompanyFields(meta);

      const existing = await client.query(api.companies.getByTicker, {
        ticker: company.ticker,
      });

      if (existing) {
        if (Object.keys(extra).length > 0) {
          await client.mutation(api.companies.patch, {
            companyId: existing._id,
            ...extra,
          });
        }
        console.log(`✅ Updated ${company.ticker} in Convex`);
      } else {
        await client.mutation(api.companies.create, {
          ticker: company.ticker,
          name: company.name,
          exchange: "HKEX",
          websiteUrl: company.websiteUrl,
          ...extra,
        });
        console.log(`✅ Created ${company.ticker} in Convex`);
      }
    } catch (error) {
      console.error(`❌ Failed to save ${company.ticker}:`, error);
    }

    // Tiny delay just in case
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log("✅ Finished seeding HKEX companies.");
}

main().catch(console.error);
