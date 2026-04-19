# Aperture

> This project was developed as a group project for the **ECON3086** course at **Hong Kong Baptist University (HKBU)**.

![Dashboard](/public/dashboard.png)

Aperture is a polymarket research analysis platform. Our workflow classifies an event (speculative or researchable), plans questions, searches and scrapes the open web, then writes a memo plus recommended markets.

## Polymarket event research (Convex workflow)

Research runs entirely in Convex using **`@convex-dev/workflow`** (durable steps and retries) and **`@convex-dev/agent`** with **Mistral** for structured LLM calls. **Firecrawl** powers web search and scraping via existing Convex actions.

```mermaid
flowchart TD
  subgraph client["UI"]
    UI["Analyze tab · Start / Re-run"]
  end

  subgraph kickoff["Start research · api.ts"]
    INS["Insert run · status pending"]
    WSTART["Start workflow researchEvent"]
    WID["Save workflow id on run"]
  end

  subgraph researchEvent["Durable workflow · workflow.ts"]
    direction TB
    C["(1) Classify event<br/>speculative vs researchable"]
    SPEC{Too speculative?}
    STOP["Stop run · speculative"]
    P["(2) Plan questions<br/>create question rows"]
    RS["Mark run · researching"]
    FAN["(3) Research each question<br/>all questions in parallel"]
    PM["(4) Pick markets<br/>write recommendations"]
    SF["(5) Write final memo<br/>mark run completed"]
    DONE["Done · memo on run"]
  end

  subgraph subagent["One question · worker.ts"]
    direction TB
    LOOP["Repeat up to 3 rounds<br/>stop early after 3 good sources"]
    S1["Web search · save hits"]
    J1["Choose URLs to open"]
    SC["Fetch pages in parallel"]
    SU["Summarize each page · tag relevant"]
    FU["Refine search query · next round"]
    CON["Merge sources into one answer"]
    QD["Save answer on question"]
    LOOP --> S1 --> J1 --> SC --> SU
    SU -->|need more| FU
    FU --> LOOP
    SU -->|enough evidence| CON --> QD
  end

  UI --> INS --> WSTART --> WID
  WID --> C --> SPEC
  SPEC -->|yes| STOP
  SPEC -->|no| P --> RS --> FAN
  FAN --> PM --> SF --> DONE

  FAN --> LOOP

  classDef terminalOk fill:#14532d,color:#fff,stroke:#166534
  classDef terminalBad fill:#78350f,color:#fff,stroke:#92400e
  classDef durable fill:#1e3a5f,color:#fff,stroke:#1e40af
  class STOP terminalBad
  class DONE terminalOk
  class C,P,PM,SF durable
```

**Why this shape:** Workflow gives durable execution without rebuilding orchestration in LangGraph for this path. Agent threads persist LLM context for debugging and future features. The UI subscribes with `useQuery` to `researchRuns`, `researchQuestions`, sources, picks, and optional `researchLogs`—no SSE route required.

### Data model (Convex)

| Table                   | Purpose                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `researchRuns`          | One run per kickoff: `eventSlug`, status lifecycle, `speculativeReason`, `finalReport`, `errorMessage`, timestamps                           |
| `researchQuestions`     | Planned questions with status (`pending` → `searching` / `scraping` / `summarizing` → `done` / `failed`), `iteration`, `consolidatedSummary` |
| `researchSearchResults` | Firecrawl search hits per question/iteration with scrape `decision`                                                                          |
| `researchSources`       | Scraped pages: URL, summary, `relevant`, `relevanceReason`                                                                                   |
| `researchMarketPicks`   | Recommended market id, `side` (YES / NO / AVOID / WATCH), conviction, rationale, key risk                                                    |
| `researchLogs`          | Debug feed: `phase`, `level`, `message`                                                                                                      |

Indexes favor listing by `runId` / `questionId` for reactive queries.

### Code map

| Area                           | Location                                                 |
| ------------------------------ | -------------------------------------------------------- |
| Workflow definition            | `convex/research/workflow.ts`                            |
| Classify + plan steps          | `convex/research/steps.ts`                               |
| Per-question subagent loop     | `convex/research/worker.ts`                              |
| Market pick + final memo       | `convex/research/synthesize.ts`                          |
| Public API (mutations/queries) | `convex/research/api.ts`, `convex/research/queries.ts`   |
| Convex components              | `convex/convex.config.ts` registers `workflow` + `agent` |
| Analyze UI                     | `app/(main)/event/[slug]/_components/analyze-panel/`     |

Authenticated users start a run from the **Analyze** tab; progress, sources, picks, and the markdown memo update live.

### Convex environment (server)

Set secrets in the Convex dashboard (or `npx convex env set`) so actions can call providers:

- `MISTRAL_API_KEY`
- `FIRECRAWL_API_KEY`

---

## Project Structure

```text
├── 📁app
│   ├── 📁(auth)         # Authentication routes
│   ├── 📁(main)         # Main application routes (Dashboard, Event)
│   ├── 📁api            # Next.js API routes (chat, scraping, polymarket)
├── 📁components
│   ├── 📁ai-elements
│   ├── 📁prompt-kit
│   ├── 📁sidebar
│   └── 📁ui
├── 📁convex
│   ├── 📁firecrawl      # Firecrawl API integrations and logic
│   └── 📁research       # Durable AI research workflow logic
├── 📁hooks
├── 📁lib
└── 📁public
```

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh/)
- A [Convex](https://convex.dev/) project
- API keys for the features you enable (see `.env.example`)

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

3. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in at least:

   ```env
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   NEXT_PUBLIC_CONVEX_SITE_URL=<your-convex-site-url>

   MISTRAL_API_KEY=<your-mistral-key>
   FIRECRAWL_API_KEY=<your-firecrawl-key>
   ```

   For production/preview deploys, also configure `CONVEX_DEPLOY_KEY` as described in `.env.example`.

4. **Convex Auth (first-time)**

   ```bash
   npx @convex-dev/auth
   ```

5. **Run the app**

   ```bash
   bun run dev
   ```

6. **Open the app**

   [http://localhost:3000](http://localhost:3000)

The `predev` script runs Convex setup hooks; see `package.json` for `dev` / `dev:frontend` / `dev:backend` split.
