# Aperture - Open Financial Intelligence

<div align="center">

**A modern, AI-powered financial terminal for everyone**

Making professional-grade financial data and insights accessible without the Bloomberg price tag.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## 🎯 Project Vision

Bloomberg Terminal costs $24,000/year. Most investors don't need all its features, just clean data, smart insights, and an intuitive interface.

**Aperture** democratizes financial intelligence by providing:

- 🔍 Intelligent search across company filings and reports
- 📊 Clean, unified financial dashboards
- 🤖 AI-powered insights and analysis
- 📰 Categorized news with sentiment analysis
- 🔔 Real-time alerts and subscriptions
- 📈 Advanced analytics without the complexity

---

## ✨ Core Features

### 1. **Intelligent Search Engine**

- Full-text and semantic search across annual reports, 10-Ks, press releases
- AI-powered context extraction from PDF documents
- Filter by company, year, document type, and financial metrics
- Natural language queries: _"Show me Apple's revenue growth concerns from 2023"_

### 2. **Unified Financial Dashboard**

- Multi-year financials (2020-2024) displayed side-by-side
- Tabbed interface: Income Statement | Balance Sheet | Cash Flow | Key Metrics
- Interactive charts for trend analysis
- Compare multiple companies simultaneously
- Export to Excel/CSV

### 3. **AI Analytics & Insights**

- **Auto-calculated metrics**: P/E, ROE, ROA, Debt-to-Equity, margins, and more
- **LLM-powered analysis**: Trend detection, red flags, bull/bear cases
- **Predictive analytics**: Revenue forecasts and anomaly detection
- **Plain-English explanations** of complex financials

### 4. **Multi-Source Data Aggregation**

- Annual & quarterly reports (10-K, 10-Q)
- SEC filings (8-K, insider transactions)
- Press releases and earnings call transcripts
- Real-time news from multiple sources
- Social sentiment analysis (optional)

### 5. **Smart News Categorization**

- AI-categorized news: Earnings, Products, M&A, Legal, Management
- Sentiment scoring and event impact analysis
- **News-to-data linking**: Connect press releases to financial trends
- Timeline view of company events

### 6. **Subscription & Alerts**

- Subscribe to specific companies
- Multi-channel notifications (push, email, in-app)
- Custom alert triggers: new filings, price movements, news
- Real-time updates on watched companies

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js (App Router) + React + TypeScript
- **Runtime**: Bun
- **UI Components**: Shadcn/ui + Tailwind CSS

### Backend

- **Database & Backend**: Convex (serverless functions, real-time DB, cron jobs)
- **Authentication**: Convex Auth
- **Search**: Convex full-text search + Exa (semantic search)

### AI & Data Processing

- **LLM**: Mistral AI (chat, embeddings, OCR)
- **Web Scraping**: Firecrawl
- **Data Sources**: SEC EDGAR API, company IR pages, financial data APIs

### Additional Services

- **Notifications**: Web Push API + Resend/SendGrid
- **Deployment**: Vercel (frontend) + Convex (backend)

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Convex account](https://convex.dev/) (free tier available)
- API keys for: Mistral AI, Exa, Firecrawl

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

   Add your API keys:

   ```env
   CONVEX_DEPLOYMENT=<your-convex-deployment>
   MISTRAL_API_KEY=<your-mistral-key>
   EXA_API_KEY=<your-exa-key>
   FIRECRAWL_API_KEY=<your-firecrawl-key>
   ```

4. **Initialize Convex Auth**

   ```bash
   npx @convex-dev/auth
   ```

5. **Run development server**

   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
aperture/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── company/[id]/      # Company detail pages
│   └── search/            # Search interface
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── companies.ts       # Company queries/mutations
│   ├── financials.ts      # Financial data functions
│   ├── news.ts            # News scraping & categorization
│   ├── search.ts          # Search functions
│   ├── subscriptions.ts   # Alert subscriptions
│   └── crons.ts           # Scheduled jobs
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── charts/           # Financial charts
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities
│   ├── mistral.ts        # Mistral AI client
│   ├── exa.ts            # Exa search client
│   └── firecrawl.ts      # Firecrawl scraper
└── public/               # Static assets
```

---

## 🎓 Academic Context

This project was built for the **ECON3086 Python Programming for FinTech** Course with the following learning objectives:

### Evaluation Criteria

- **Practical Application (20%)**: Solving the problem of expensive financial data access
- **Basic Programming (30%)**: Complex data pipelines, TypeScript, error handling, clean React architecture
- **Library Usage (40%)**: Advanced integration of AI APIs, web scraping, real-time databases, charting libraries
- **Presentation (10%)**: Live demonstration of search, AI insights, and real-time alerts

### Key Learning Outcomes

- Building production-grade full-stack applications
- Integrating multiple third-party APIs and AI services
- Implementing real-time data synchronization
- Web scraping and data extraction techniques
- Financial data analysis and visualization
- User authentication and authorization
- Responsive UI/UX design

---

## 📚 Documentation

### Key Features Documentation

- **[Search Engine](docs/search.md)**: How semantic search and PDF extraction works
- **[AI Insights](docs/ai-insights.md)**: LLM-powered financial analysis
- **[Data Pipeline](docs/data-pipeline.md)**: Scraping, processing, and storing financial data
- **[Alerts System](docs/alerts.md)**: Subscription and notification architecture

### Development Guides

- [Adding New Data Sources](docs/add-data-source.md)
- [Creating Custom Metrics](docs/custom-metrics.md)
- [Extending AI Capabilities](docs/extend-ai.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Bloomberg L.P.** for inspiration on what professional financial terminals can do
- **Convex** for the amazing real-time backend platform
- **Mistral AI** for powerful and affordable AI capabilities
- Our course instructor and peers for feedback and support

---

<div align="center">

**Built with ❤️ using Convex, Next.js, and AI**

_Making financial intelligence accessible to everyone_

</div>
