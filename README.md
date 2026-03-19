# Aperture — Open Financial Intelligence

<div align="center">

**An AI-native financial research terminal for everyone**

Aperture is a modern web-based alternative to expensive financial terminals: clean market data, searchable filings, structured financials, document chat, alerts, and research workflows — all in one place.

[Vision](#-project-vision) • [Features](#-core-features) • [Dashboard](#-dashboard-layout) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 🎯 Project Vision

Traditional financial terminals are powerful, but expensive, dense, and often overbuilt for students, independent investors, startup teams, and many professionals who just need the essentials done well.

**Aperture** aims to make core financial intelligence accessible through a more intuitive, AI-first interface.

### Aperture is designed around 5 core workflows:

- **Monitor** markets, watchlists, filings, and catalysts
- **Investigate** companies through source documents and structured metrics
- **Compare** companies, trends, and valuation multiples
- **Search** across filings, annual reports, press releases, and transcripts
- **Ask** natural-language questions grounded in real financial documents

Instead of being just another finance news site or chatbot, Aperture is being built as a **research terminal**.

---

## ✨ Core Features

### 1. Universal Financial Search

Search across:

- public companies
- annual reports / 10-K / 10-Q
- press releases
- earnings transcripts
- financial metrics
- people, topics, and themes

Examples:

- `What changed in NVIDIA's latest 8-K?`
- `Apple gross margin trend over 5 years`
- `10-Ks mentioning tariffs in 2024`
- `Semiconductor companies with high FCF margin`

### 2. Financial Documents in Markdown

One of Aperture’s core product features is turning hard-to-read financial documents into something searchable and AI-friendly.

Supported workflow:

- discover and fetch filings / reports / PDFs
- extract text with OCR
- convert into clean markdown
- preserve sections, headings, and tables
- search within documents
- chat with a single document or a company’s document set
- cite exact passages and source sections

### 3. Company Research Workspace

Each company page is designed as a compact research terminal:

- live price and % change
- market cap, EV, P/E, and key ratios
- multi-year income statement / balance sheet / cash flow
- charts for price, revenue, margins, EPS, and FCF
- latest filings, press, and transcripts
- AI summaries of important changes
- peer comparison and alerts

### 4. AI Copilot for Source-Grounded Analysis

Aperture uses AI to help users move faster, but keeps analysis grounded in actual documents and data.

AI features include:

- filing summaries
- earnings transcript highlights
- key risk extraction
- metric explanations in plain English
- bull / bear framing
- change detection between old vs new documents
- source-cited Q&A over company docs and structured financials

### 5. Watchlists, Alerts, and Research Monitoring

Users can subscribe to companies, documents, and custom conditions.

Alert types include:

- new filing or annual report
- earnings release / transcript published
- price or volume movement
- metric thresholds
- company-specific updates
- semantic alerts from filings and press releases

Examples:

- notify me when Tesla mentions “guidance cut”
- alert me if Apple drops more than 3%
- tell me when a semiconductor company files a new 10-Q
- notify me when buyback language changes in a filing

### 6. Unified Structured Financials

Aperture combines market APIs with extracted document intelligence.

Structured views include:

- annual and quarterly financial statements
- key ratios and derived metrics
- trend analysis
- side-by-side company comparison
- exportable financial tables

### 7. Smart Market Dashboard

The root dashboard is being redesigned to feel less like a news homepage and more like a real terminal.

It focuses on:

- what moved markets today
- what changed in your watchlist
- what new filings and documents dropped
- what upcoming catalysts matter
- what to investigate next

---

## 🖥 Dashboard Layout

Aperture’s root dashboard is organized as a personalized research workspace.

### Left Sidebar

The top navigation is moved into a persistent sidebar for faster workflow switching.

Sections include:

- **Overview**
- **Watchlists**
- **Documents**
- **Screeners**
- **Calendar**
- **Macro**
- **Movers**
- **Saved**

Below the navigation, the sidebar can also show:

- recent AI chats
- pinned research threads
- saved searches
- recently viewed companies or documents

This makes Aperture feel more like a working terminal and less like a traditional website.

### Top Bar

The top bar contains:

- universal search / command palette
- region toggle
- alerts
- quick actions
- user menu

Example search:

> Search stocks, filings, metrics, people, reports, topics...

### Dashboard Modules

The homepage is centered around these modules:

#### Market Pulse

A compact strip for major assets such as:

- S&P 500
- Nasdaq
- US 10Y
- DXY
- WTI / Brent
- Gold
- BTC
- VIX

#### Today in Your Universe

A personalized high-signal feed showing:

- new filings
- major price moves
- parsed transcripts
- guidance changes
- watchlist events
- AI-detected document changes

#### Market Summary

A concise summary of the day’s most relevant macro and market developments.

#### New Documents / Filings

A feed of:

- 10-K / 10-Q / 8-K
- annual reports
- transcripts
- investor presentations
- press releases

with processing states such as:

- queued
- OCR complete
- parsed
- summarized
- diff available

#### Watchlist

A compact list of followed companies with:

- live price
- % change
- badges for filings / earnings / alerts
- quick access to research pages

#### Upcoming Catalysts

A calendar-style panel for:

- earnings
- ex-dividend dates
- annual meetings
- macro releases
- watchlist events

#### Alert Inbox

A dedicated place for actionable updates rather than just generic notifications.

#### Ask Aperture

A persistent AI input for fast questions like:

- compare Apple and Microsoft gross margin over 5 years
- what changed in NVIDIA’s latest 8-K
- summarize the latest TSM transcript
- show 2024 filings mentioning tariffs

---

## 🧠 Product Direction

Aperture is not trying to replicate every Bloomberg feature.

The product is focused on a narrower but highly valuable set of workflows:

- public company research
- filings and earnings intelligence
- financial statement analysis
- market monitoring
- alerts and investigation

### Near-term MVP priorities

- universal finance search
- company pages with structured financials
- markdown document reader
- source-grounded AI chat
- watchlists
- alerts
- market dashboard
- upcoming catalysts
- peer comparison

### Next features

- filing diff / change detection
- advanced screener
- semantic document alerts
- saved research views
- annotation and collaboration
- portfolio and holdings workspace

---

## 🔌 Data & Intelligence Stack

Aperture combines multiple APIs and AI tools into one research workflow.

### Market Data

- **Finnhub** — quotes, price changes, market updates, calendar data
- **Yahoo Finance / yfinance** — backup market data and basic metrics
- **FMP (Financial Modeling Prep)** — structured financial statements and company fundamentals

### Discovery & Scraping

- **Exa** — search and source discovery
- **Firecrawl** — crawling, mapping, scraping, and source retrieval

### Document Intelligence

- **Mistral OCR** — PDF text extraction
- **Mistral LLMs** — summarization, extraction, tagging, change detection, chat

### App Infrastructure

- **Next.js** — frontend app
- **Bun** — runtime and package manager
- **Convex** — backend, database, realtime queries, cron jobs, auth

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui

### Backend

- **Backend + Database**: Convex
- **Authentication**: Convex Auth
- **Realtime**: Convex subscriptions / queries
- **Jobs / Scheduling**: Convex cron jobs

### AI / Search / Extraction

- **LLM / OCR**: Mistral AI
- **Semantic / web search**: Exa
- **Scraping / crawling**: Firecrawl

### Notifications

- **Push / Email / In-app**: Web Push API + Resend or SendGrid

### Deployment

- **Frontend**: Vercel
- **Backend**: Convex

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- [Bun](https://bun.sh/)
- a [Convex account](https://convex.dev/)
- API keys for the services you want to enable

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd aperture
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Add your environment variables**

   ```env
   CONVEX_DEPLOYMENT=<your-convex-deployment>
   MISTRAL_API_KEY=<your-mistral-key>
   EXA_API_KEY=<your-exa-key>
   FIRECRAWL_API_KEY=<your-firecrawl-key>
   FMP_API_KEY=<your-fmp-key>
   FINNHUB_API_KEY=<your-finnhub-key>
   ```

   Notes:
   - `FINNHUB_API_KEY` can also be set in the [Convex dashboard](https://dashboard.convex.dev)
   - Yahoo-based routes may not require an API key depending on implementation
   - Some quote routes may use fallback providers

5. **Initialize Convex Auth**

   ```bash
   npx @convex-dev/auth
   ```

6. **Run the development server**

   ```bash
   bun run dev
   ```

7. **Open the app**

   Visit: [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```text
aperture/
├── app/
│   ├── (auth)/                 # Authentication pages
│   ├── dashboard/              # Root dashboard / terminal view
│   ├── company/[id]/           # Company research workspace
│   ├── search/                 # Search results and query views
│   └── api/
│       ├── chat/
│       │   └── route.ts
│       ├── exa/
│       │   ├── search/route.ts
│       │   ├── search-and-contents/route.ts
│       │   └── scrape/
│       │       ├── route.ts
│       │       ├── batch/route.ts
│       │       └── subpages/route.ts
│       ├── firecrawl/
│       │   ├── agent/route.ts
│       │   ├── crawl/route.ts
│       │   ├── map/route.ts
│       │   ├── scrape/route.ts
│       │   ├── search/route.ts
│       │   ├── firecrawlClient.ts
│       │   └── types.ts
│       ├── finnhub/
│       │   └── [ticker]/route.ts
│       ├── fmp/
│       │   └── [ticker]/route.ts
│       ├── ocr/
│       │   └── route.ts
│       └── yahoo/
│           └── [ticker]/route.ts
├── convex/
│   ├── schema.ts               # Database schema
│   ├── companies.ts            # Company queries and mutations
│   ├── financials.ts           # Structured financial data
│   ├── documents.ts            # Parsed filings / reports
│   ├── news.ts                 # News ingestion and categorization
│   ├── search.ts               # Search functions
│   ├── subscriptions.ts        # Alerts and subscriptions
│   └── crons.ts                # Scheduled jobs
├── components/
│   ├── ui/                     # Shared UI components
│   ├── dashboard/              # Dashboard widgets
│   ├── charts/                 # Market / financial charts
│   ├── documents/              # Document reader components
│   └── chat/                   # AI chat components
├── lib/                        # Utilities, helpers, clients
├── public/                     # Static assets
└── docs/                       # Project docs
```

---

## 🔍 Example Use Cases

Aperture is meant to support workflows like:

- reading a company’s 10-K in clean markdown
- asking AI to extract key risks and cite the exact section
- comparing revenue growth, margin expansion, and valuation across peers
- monitoring a watchlist for new filings and earnings
- seeing what changed between the latest and previous report
- searching for thematic signals across many companies

Example prompts:

- `Summarize the key risks in Adobe's latest annual report`
- `Compare Apple, Microsoft, and Google operating margins over 5 years`
- `Show the most recent semiconductor earnings transcripts`
- `What changed in Tesla's risk factors this quarter?`
- `Find companies mentioning restructuring in the last 30 days`

---

## 🗺 Roadmap

### In Progress

- dashboard redesign with left sidebar + recent chats
- document reader and company chat workflow
- structured financial statement views
- market pulse and watchlist monitoring

### Planned

- filing diff and redline comparison
- semantic alerts
- saved research workspaces
- advanced screener
- peer comps table
- analyst-style event summaries
- collaboration and annotations

---

## 🎓 Academic Context

This project was built in the context of the **ECON3086 Python Programming for FinTech** course.

### Learning goals demonstrated

- full-stack application design
- API integration across multiple providers
- financial data processing and visualization
- web scraping and document extraction
- AI-assisted search and summarization
- realtime backend workflows
- user authentication and notifications

---

## 📚 Documentation

Planned or existing docs may include:

- `docs/search.md` — semantic and document search
- `docs/data-pipeline.md` — scraping, OCR, extraction, indexing
- `docs/ai-insights.md` — source-grounded analysis
- `docs/alerts.md` — subscriptions and notification flow
- `docs/dashboard.md` — homepage information architecture
- `docs/company-page.md` — company workspace design

---

## ⚠️ Notes

Aperture is an educational and product prototyping project.

Depending on deployment and commercial usage, some data providers may require:

- production API plans
- redistribution rights
- commercial licensing compliance

Always verify the terms of any market data, news, or scraped content source used in production.

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

## 🙏 Acknowledgments

- **Bloomberg** for inspiring what a great research terminal can feel like
- **Convex** for realtime backend infrastructure
- **Mistral AI** for OCR and language models
- **Exa** for semantic discovery
- **Firecrawl** for web crawling and scraping
- instructors, peers, and early testers for feedback

---

<div align="center">

**Built with Bun, Next.js, and Convex**

_A modern financial research terminal for everyone_

</div>
