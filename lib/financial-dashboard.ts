export type PeriodView = "annual" | "semiannual" | "quarterly";
export type SheetType =
  | "keyStats"
  | "income"
  | "balance"
  | "cashflow"
  | "segments"
  | "adjusted";
export type DisplayUnit = "thousands" | "millions" | "billions";
export type CurrencyCode =
  | "USD"
  | "HKD"
  | "RMB"
  | "JPY"
  | "VND"
  | "EUR"
  | "AUD"
  | "KRW";
export type NumberFormat = "number" | "percent" | "ratio";

export type StatementRow = {
  label: string;
  values: Record<string, number | null>;
  format?: NumberFormat;
};

export type FinancialDataset = {
  periods: string[];
  marketPrice: Record<string, number>;
  sharesOutstanding: Record<string, number>;
  income: StatementRow[];
  balance: StatementRow[];
  cashflow: StatementRow[];
  segments: StatementRow[];
  adjusted: StatementRow[];
};

export type CompanyProfile = {
  slug: string;
  name: string;
  ticker: string;
  exchange: string;
  country?: string;
  logoDomain?: string;
  sector: string;
  sourceLabel: string;
  sourceUrl?: string;
  lastUpdated?: string;
};

export type CompanyFinancialPayload = {
  sourceKind: "demo" | "official-extract";
  company: CompanyProfile;
  datasets: Record<PeriodView, FinancialDataset>;
  message?: string;
};

const demoDatasets: Record<PeriodView, FinancialDataset> = {
  annual: {
    periods: ["2020", "2021", "2022", "2023", "2024"],
    marketPrice: {
      "2020": 13.2,
      "2021": 29.6,
      "2022": 14.6,
      "2023": 49.2,
      "2024": 121.5,
    },
    sharesOutstanding: {
      "2020": 24.9,
      "2021": 24.8,
      "2022": 24.7,
      "2023": 24.6,
      "2024": 24.5,
    },
    income: [
      {
        label: "Total Revenue",
        values: {
          "2020": 10918,
          "2021": 16675,
          "2022": 26974,
          "2023": 60922,
          "2024": 130497,
        },
      },
      {
        label: "Cost of Sales",
        values: {
          "2020": 3768,
          "2021": 6279,
          "2022": 11618,
          "2023": 16621,
          "2024": 32639,
        },
      },
      {
        label: "Gross Profit",
        values: {
          "2020": 7150,
          "2021": 10396,
          "2022": 15356,
          "2023": 44301,
          "2024": 97858,
        },
      },
      {
        label: "Research & Development",
        values: {
          "2020": 2829,
          "2021": 3975,
          "2022": 7339,
          "2023": 8675,
          "2024": 12914,
        },
      },
      {
        label: "Selling, General & Administrative",
        values: {
          "2020": 1090,
          "2021": 1200,
          "2022": 2440,
          "2023": 2654,
          "2024": 3491,
        },
      },
      {
        label: "Operating Profit",
        values: {
          "2020": 2846,
          "2021": 4532,
          "2022": 4224,
          "2023": 32972,
          "2024": 81453,
        },
      },
      {
        label: "Income Before Taxes",
        values: {
          "2020": 2796,
          "2021": 4332,
          "2022": 4181,
          "2023": 33818,
          "2024": 84026,
        },
      },
      {
        label: "Net Income",
        values: {
          "2020": 4322,
          "2021": 4332,
          "2022": 4368,
          "2023": 29760,
          "2024": 72880,
        },
      },
      {
        label: "Diluted EPS",
        values: {
          "2020": 0.16,
          "2021": 0.17,
          "2022": 0.17,
          "2023": 1.19,
          "2024": 2.94,
        },
        format: "ratio",
      },
    ],
    balance: [
      {
        label: "Cash & Cash Equivalents",
        values: {
          "2020": 8479,
          "2021": 1993,
          "2022": 3389,
          "2023": 7280,
          "2024": 8589,
        },
      },
      {
        label: "Short-Term Investments",
        values: {
          "2020": 1075,
          "2021": 907,
          "2022": 9907,
          "2023": 18704,
          "2024": 34621,
        },
      },
      {
        label: "Total Cash & Cash Equivalents",
        values: {
          "2020": 9554,
          "2021": 2900,
          "2022": 13296,
          "2023": 25984,
          "2024": 43210,
        },
      },
      {
        label: "Accounts Receivable",
        values: {
          "2020": 1990,
          "2021": 1650,
          "2022": 3827,
          "2023": 9999,
          "2024": 23065,
        },
      },
      {
        label: "Inventories",
        values: {
          "2020": 979,
          "2021": 2237,
          "2022": 5159,
          "2023": 5282,
          "2024": 10080,
        },
      },
      {
        label: "Total Assets",
        values: {
          "2020": 22897,
          "2021": 16295,
          "2022": 41182,
          "2023": 65728,
          "2024": 111601,
        },
      },
      {
        label: "Short-Term Debt",
        values: { "2020": 0, "2021": 0, "2022": 1250, "2023": 1250, "2024": 0 },
      },
      {
        label: "Long-Term Debt",
        values: {
          "2020": 5964,
          "2021": 5964,
          "2022": 9703,
          "2023": 8459,
          "2024": 8463,
        },
      },
      {
        label: "Total Liabilities",
        values: {
          "2020": 10396,
          "2021": 11198,
          "2022": 19081,
          "2023": 22750,
          "2024": 32274,
        },
      },
      {
        label: "Total Shareholders' Equity",
        values: {
          "2020": 12501,
          "2021": 5097,
          "2022": 22101,
          "2023": 42978,
          "2024": 79327,
        },
      },
    ],
    cashflow: [
      {
        label: "Net Income",
        values: {
          "2020": 4322,
          "2021": 4332,
          "2022": 4368,
          "2023": 29760,
          "2024": 72880,
        },
      },
      {
        label: "Depreciation & Amortization",
        values: {
          "2020": 1091,
          "2021": 1149,
          "2022": 1544,
          "2023": 1508,
          "2024": 1864,
        },
      },
      {
        label: "Share-Based Compensation",
        values: {
          "2020": 1283,
          "2021": 1621,
          "2022": 2709,
          "2023": 3549,
          "2024": 4737,
        },
      },
      {
        label: "Cash from Operating Activities",
        values: {
          "2020": 5822,
          "2021": 9108,
          "2022": 5641,
          "2023": 28090,
          "2024": 64089,
        },
      },
      {
        label: "Capital Expenditure",
        values: {
          "2020": -978,
          "2021": -1028,
          "2022": -1833,
          "2023": -1069,
          "2024": -3236,
        },
      },
      {
        label: "Cash from Investing Activities",
        values: {
          "2020": -1379,
          "2021": -983,
          "2022": 7375,
          "2023": -10566,
          "2024": -20421,
        },
      },
      {
        label: "Cash from Financing Activities",
        values: {
          "2020": -3136,
          "2021": -844,
          "2022": -11617,
          "2023": -13633,
          "2024": -42359,
        },
      },
      {
        label: "Increase / Decrease in Cash",
        values: {
          "2020": 1307,
          "2021": 7281,
          "2022": 1399,
          "2023": 3891,
          "2024": 1309,
        },
      },
    ],
    segments: [
      {
        label: "Data Center Revenue",
        values: {
          "2020": 2983,
          "2021": 6752,
          "2022": 15005,
          "2023": 47525,
          "2024": 115186,
        },
      },
      {
        label: "Gaming Revenue",
        values: {
          "2020": 5498,
          "2021": 7605,
          "2022": 9067,
          "2023": 10447,
          "2024": 11350,
        },
      },
      {
        label: "Professional Visualization Revenue",
        values: {
          "2020": 1053,
          "2021": 2111,
          "2022": 1544,
          "2023": 1553,
          "2024": 1878,
        },
      },
      {
        label: "Automotive Revenue",
        values: {
          "2020": 700,
          "2021": 566,
          "2022": 903,
          "2023": 1091,
          "2024": 1694,
        },
      },
      {
        label: "Compute & Networking Operating Income",
        values: {
          "2020": 0,
          "2021": 0,
          "2022": 5083,
          "2023": 32016,
          "2024": 82875,
        },
      },
      {
        label: "Graphics Operating Income",
        values: {
          "2020": 0,
          "2021": 0,
          "2022": 4552,
          "2023": 5846,
          "2024": 5085,
        },
      },
      {
        label: "Remaining Performance Obligations",
        values: {
          "2020": 350,
          "2021": 450,
          "2022": 652,
          "2023": 1100,
          "2024": 1700,
        },
      },
    ],
    adjusted: [
      {
        label: "Adjusted Revenue",
        values: {
          "2020": 10918,
          "2021": 16675,
          "2022": 26974,
          "2023": 60922,
          "2024": 130497,
        },
      },
      {
        label: "Adjusted Gross Margin",
        values: {
          "2020": 66.7,
          "2021": 63.1,
          "2022": 59.2,
          "2023": 73.8,
          "2024": 75.5,
        },
        format: "percent",
      },
      {
        label: "Adjusted EBIT",
        values: {
          "2020": 3180,
          "2021": 4958,
          "2022": 9040,
          "2023": 37134,
          "2024": 86789,
        },
      },
      {
        label: "Adjusted EBIT Margin",
        values: {
          "2020": 29.1,
          "2021": 29.7,
          "2022": 33.5,
          "2023": 61.0,
          "2024": 66.5,
        },
        format: "percent",
      },
      {
        label: "Adjusted EBITDA",
        values: {
          "2020": 4271,
          "2021": 6107,
          "2022": 5768,
          "2023": 34480,
          "2024": 83317,
        },
      },
      {
        label: "Adjusted Net Income",
        values: {
          "2020": 4490,
          "2021": 4870,
          "2022": 8366,
          "2023": 32312,
          "2024": 74265,
        },
      },
      {
        label: "Adjusted EPS",
        values: {
          "2020": 0.18,
          "2021": 0.19,
          "2022": 0.3,
          "2023": 1.0,
          "2024": 3.0,
        },
        format: "ratio",
      },
      {
        label: "Adjusted Free Cash Flow",
        values: {
          "2020": 4844,
          "2021": 8080,
          "2022": 3750,
          "2023": 26947,
          "2024": 60724,
        },
      },
    ],
  },
  semiannual: {
    periods: ["2023-H1", "2023-H2", "2024-H1", "2024-H2"],
    marketPrice: {
      "2023-H1": 43.5,
      "2023-H2": 49.2,
      "2024-H1": 96.4,
      "2024-H2": 121.5,
    },
    sharesOutstanding: {
      "2023-H1": 24.7,
      "2023-H2": 24.6,
      "2024-H1": 24.6,
      "2024-H2": 24.5,
    },
    income: [
      {
        label: "Total Revenue",
        values: {
          "2023-H1": 22300,
          "2023-H2": 38622,
          "2024-H1": 56000,
          "2024-H2": 74497,
        },
      },
      {
        label: "Gross Profit",
        values: {
          "2023-H1": 15800,
          "2023-H2": 28501,
          "2024-H1": 40500,
          "2024-H2": 57358,
        },
      },
      {
        label: "Operating Profit",
        values: {
          "2023-H1": 10300,
          "2023-H2": 22672,
          "2024-H1": 32700,
          "2024-H2": 48753,
        },
      },
      {
        label: "Net Income",
        values: {
          "2023-H1": 9500,
          "2023-H2": 20260,
          "2024-H1": 30800,
          "2024-H2": 42080,
        },
      },
      {
        label: "Diluted EPS",
        values: {
          "2023-H1": 0.38,
          "2023-H2": 0.81,
          "2024-H1": 1.24,
          "2024-H2": 1.7,
        },
        format: "ratio",
      },
    ],
    balance: [
      {
        label: "Total Cash & Cash Equivalents",
        values: {
          "2023-H1": 21000,
          "2023-H2": 25984,
          "2024-H1": 36200,
          "2024-H2": 43210,
        },
      },
      {
        label: "Accounts Receivable",
        values: {
          "2023-H1": 7800,
          "2023-H2": 9999,
          "2024-H1": 16000,
          "2024-H2": 23065,
        },
      },
      {
        label: "Inventories",
        values: {
          "2023-H1": 4700,
          "2023-H2": 5282,
          "2024-H1": 8200,
          "2024-H2": 10080,
        },
      },
      {
        label: "Total Assets",
        values: {
          "2023-H1": 51500,
          "2023-H2": 65728,
          "2024-H1": 88000,
          "2024-H2": 111601,
        },
      },
      {
        label: "Long-Term Debt",
        values: {
          "2023-H1": 8600,
          "2023-H2": 8459,
          "2024-H1": 8475,
          "2024-H2": 8463,
        },
      },
      {
        label: "Total Liabilities",
        values: {
          "2023-H1": 20500,
          "2023-H2": 22750,
          "2024-H1": 27500,
          "2024-H2": 32274,
        },
      },
      {
        label: "Total Shareholders' Equity",
        values: {
          "2023-H1": 31000,
          "2023-H2": 42978,
          "2024-H1": 60500,
          "2024-H2": 79327,
        },
      },
    ],
    cashflow: [
      {
        label: "Cash from Operating Activities",
        values: {
          "2023-H1": 12600,
          "2023-H2": 15490,
          "2024-H1": 27200,
          "2024-H2": 36889,
        },
      },
      {
        label: "Capital Expenditure",
        values: {
          "2023-H1": -420,
          "2023-H2": -649,
          "2024-H1": -1400,
          "2024-H2": -1836,
        },
      },
      {
        label: "Cash from Investing Activities",
        values: {
          "2023-H1": -5900,
          "2023-H2": -4666,
          "2024-H1": -9100,
          "2024-H2": -11321,
        },
      },
      {
        label: "Cash from Financing Activities",
        values: {
          "2023-H1": -5400,
          "2023-H2": -8233,
          "2024-H1": -21000,
          "2024-H2": -21359,
        },
      },
      {
        label: "Increase / Decrease in Cash",
        values: {
          "2023-H1": 1300,
          "2023-H2": 2591,
          "2024-H1": 1700,
          "2024-H2": -1791,
        },
      },
    ],
    segments: [
      {
        label: "Data Center Revenue",
        values: {
          "2023-H1": 17600,
          "2023-H2": 29925,
          "2024-H1": 52000,
          "2024-H2": 63186,
        },
      },
      {
        label: "Gaming Revenue",
        values: {
          "2023-H1": 4700,
          "2023-H2": 5747,
          "2024-H1": 5400,
          "2024-H2": 5950,
        },
      },
      {
        label: "Compute & Networking Revenue",
        values: {
          "2023-H1": 17400,
          "2023-H2": 30005,
          "2024-H1": 52300,
          "2024-H2": 63893,
        },
      },
      {
        label: "Graphics Revenue",
        values: {
          "2023-H1": 4900,
          "2023-H2": 8617,
          "2024-H1": 3700,
          "2024-H2": 10604,
        },
      },
      {
        label: "Remaining Performance Obligations",
        values: {
          "2023-H1": 900,
          "2023-H2": 1100,
          "2024-H1": 1450,
          "2024-H2": 1700,
        },
      },
    ],
    adjusted: [
      {
        label: "Adjusted Revenue",
        values: {
          "2023-H1": 22300,
          "2023-H2": 38622,
          "2024-H1": 56000,
          "2024-H2": 74497,
        },
      },
      {
        label: "Adjusted Gross Margin",
        values: {
          "2023-H1": 71.0,
          "2023-H2": 75.4,
          "2024-H1": 74.8,
          "2024-H2": 76.2,
        },
        format: "percent",
      },
      {
        label: "Adjusted EBIT",
        values: {
          "2023-H1": 11400,
          "2023-H2": 25734,
          "2024-H1": 34200,
          "2024-H2": 52589,
        },
      },
      {
        label: "Adjusted EBITDA",
        values: {
          "2023-H1": 13500,
          "2023-H2": 20980,
          "2024-H1": 38200,
          "2024-H2": 45117,
        },
      },
      {
        label: "Adjusted Net Income",
        values: {
          "2023-H1": 10100,
          "2023-H2": 22212,
          "2024-H1": 31900,
          "2024-H2": 42365,
        },
      },
      {
        label: "Adjusted EPS",
        values: {
          "2023-H1": 0.4,
          "2023-H2": 0.89,
          "2024-H1": 1.28,
          "2024-H2": 1.72,
        },
        format: "ratio",
      },
      {
        label: "Adjusted Free Cash Flow",
        values: {
          "2023-H1": 12180,
          "2023-H2": 14820,
          "2024-H1": 25800,
          "2024-H2": 34924,
        },
      },
    ],
  },
  quarterly: {
    periods: ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"],
    marketPrice: {
      "2024-Q1": 86,
      "2024-Q2": 106,
      "2024-Q3": 118,
      "2024-Q4": 121.5,
    },
    sharesOutstanding: {
      "2024-Q1": 24.6,
      "2024-Q2": 24.6,
      "2024-Q3": 24.5,
      "2024-Q4": 24.5,
    },
    income: [
      {
        label: "Total Revenue",
        values: {
          "2024-Q1": 26000,
          "2024-Q2": 30000,
          "2024-Q3": 34700,
          "2024-Q4": 39797,
        },
      },
      {
        label: "Gross Profit",
        values: {
          "2024-Q1": 19000,
          "2024-Q2": 21500,
          "2024-Q3": 26400,
          "2024-Q4": 30958,
        },
      },
      {
        label: "Operating Profit",
        values: {
          "2024-Q1": 14500,
          "2024-Q2": 18200,
          "2024-Q3": 22700,
          "2024-Q4": 26053,
        },
      },
      {
        label: "Net Income",
        values: {
          "2024-Q1": 13500,
          "2024-Q2": 17300,
          "2024-Q3": 20500,
          "2024-Q4": 21580,
        },
      },
      {
        label: "Diluted EPS",
        values: {
          "2024-Q1": 0.54,
          "2024-Q2": 0.7,
          "2024-Q3": 0.84,
          "2024-Q4": 0.88,
        },
        format: "ratio",
      },
    ],
    balance: [
      {
        label: "Total Cash & Cash Equivalents",
        values: {
          "2024-Q1": 31000,
          "2024-Q2": 36000,
          "2024-Q3": 40100,
          "2024-Q4": 43210,
        },
      },
      {
        label: "Accounts Receivable",
        values: {
          "2024-Q1": 12500,
          "2024-Q2": 15800,
          "2024-Q3": 19700,
          "2024-Q4": 23065,
        },
      },
      {
        label: "Inventories",
        values: {
          "2024-Q1": 6300,
          "2024-Q2": 7200,
          "2024-Q3": 8600,
          "2024-Q4": 10080,
        },
      },
      {
        label: "Total Assets",
        values: {
          "2024-Q1": 90500,
          "2024-Q2": 96500,
          "2024-Q3": 103900,
          "2024-Q4": 111601,
        },
      },
      {
        label: "Long-Term Debt",
        values: {
          "2024-Q1": 8470,
          "2024-Q2": 8472,
          "2024-Q3": 8479,
          "2024-Q4": 8463,
        },
      },
      {
        label: "Total Liabilities",
        values: {
          "2024-Q1": 26400,
          "2024-Q2": 28100,
          "2024-Q3": 30150,
          "2024-Q4": 32274,
        },
      },
      {
        label: "Total Shareholders' Equity",
        values: {
          "2024-Q1": 64100,
          "2024-Q2": 68400,
          "2024-Q3": 73750,
          "2024-Q4": 79327,
        },
      },
    ],
    cashflow: [
      {
        label: "Cash from Operating Activities",
        values: {
          "2024-Q1": 11700,
          "2024-Q2": 13100,
          "2024-Q3": 18300,
          "2024-Q4": 20989,
        },
      },
      {
        label: "Capital Expenditure",
        values: {
          "2024-Q1": -600,
          "2024-Q2": -800,
          "2024-Q3": -830,
          "2024-Q4": -1006,
        },
      },
      {
        label: "Cash from Investing Activities",
        values: {
          "2024-Q1": -4300,
          "2024-Q2": -4800,
          "2024-Q3": -5200,
          "2024-Q4": -6121,
        },
      },
      {
        label: "Cash from Financing Activities",
        values: {
          "2024-Q1": -8100,
          "2024-Q2": -9500,
          "2024-Q3": -10800,
          "2024-Q4": -13959,
        },
      },
      {
        label: "Increase / Decrease in Cash",
        values: {
          "2024-Q1": 1100,
          "2024-Q2": 1300,
          "2024-Q3": 1700,
          "2024-Q4": -97,
        },
      },
    ],
    segments: [
      {
        label: "Data Center Revenue",
        values: {
          "2024-Q1": 23500,
          "2024-Q2": 28000,
          "2024-Q3": 30600,
          "2024-Q4": 33086,
        },
      },
      {
        label: "Gaming Revenue",
        values: {
          "2024-Q1": 2600,
          "2024-Q2": 2800,
          "2024-Q3": 2900,
          "2024-Q4": 3050,
        },
      },
      {
        label: "Compute & Networking Revenue",
        values: {
          "2024-Q1": 23600,
          "2024-Q2": 28100,
          "2024-Q3": 30800,
          "2024-Q4": 33693,
        },
      },
      {
        label: "Graphics Revenue",
        values: {
          "2024-Q1": 2400,
          "2024-Q2": 1900,
          "2024-Q3": 3900,
          "2024-Q4": 6104,
        },
      },
      {
        label: "Remaining Performance Obligations",
        values: {
          "2024-Q1": 1350,
          "2024-Q2": 1450,
          "2024-Q3": 1580,
          "2024-Q4": 1700,
        },
      },
    ],
    adjusted: [
      {
        label: "Adjusted Revenue",
        values: {
          "2024-Q1": 26000,
          "2024-Q2": 30000,
          "2024-Q3": 34700,
          "2024-Q4": 39797,
        },
      },
      {
        label: "Adjusted Gross Margin",
        values: {
          "2024-Q1": 73.1,
          "2024-Q2": 71.7,
          "2024-Q3": 76.1,
          "2024-Q4": 77.8,
        },
        format: "percent",
      },
      {
        label: "Adjusted EBIT",
        values: {
          "2024-Q1": 15100,
          "2024-Q2": 19200,
          "2024-Q3": 23900,
          "2024-Q4": 28589,
        },
      },
      {
        label: "Adjusted EBITDA",
        values: {
          "2024-Q1": 16000,
          "2024-Q2": 20500,
          "2024-Q3": 25100,
          "2024-Q4": 31717,
        },
      },
      {
        label: "Adjusted Net Income",
        values: {
          "2024-Q1": 13900,
          "2024-Q2": 17700,
          "2024-Q3": 21000,
          "2024-Q4": 21665,
        },
      },
      {
        label: "Adjusted EPS",
        values: {
          "2024-Q1": 0.56,
          "2024-Q2": 0.72,
          "2024-Q3": 0.86,
          "2024-Q4": 0.89,
        },
        format: "ratio",
      },
      {
        label: "Adjusted Free Cash Flow",
        values: {
          "2024-Q1": 11100,
          "2024-Q2": 12300,
          "2024-Q3": 17470,
          "2024-Q4": 19983,
        },
      },
    ],
  },
};

const demoProfiles: Record<string, CompanyProfile> = {
  nvda: {
    slug: "nvda",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    exchange: "NASDAQ",
    country: "United States",
    logoDomain: "nvidia.com",
    sector: "Semiconductors",
    sourceLabel: "Demo fallback",
  },
  nvidia: {
    slug: "nvidia",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    exchange: "NASDAQ",
    country: "United States",
    logoDomain: "nvidia.com",
    sector: "Semiconductors",
    sourceLabel: "Demo fallback",
  },
};

export function getDemoCompanyFinancialPayload(
  companySlug: string,
): CompanyFinancialPayload {
  const normalizedSlug = companySlug.toLowerCase();
  const company = demoProfiles[normalizedSlug] ?? {
    slug: normalizedSlug,
    name: companySlug.toUpperCase(),
    ticker: companySlug.slice(0, 5).toUpperCase(),
    exchange: "Official Source Pending",
    country: "—",
    logoDomain: normalizedSlug,
    sector: "Unclassified",
    sourceLabel: "Demo fallback",
  };

  return {
    sourceKind: "demo",
    company,
    datasets: demoDatasets,
    message:
      "This route is ready for official-company extraction output. Replace the demo payload with your normalized extractor response.",
  };
}
