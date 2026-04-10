# Aperture

```mermaid
flowchart TD
    START([START])
    --> A[ingest_event<br/>Fetch market metadata]
    --> B[speculative_filter<br/>Speculative check?]

    B -->|Speculative| Z[end_with_message<br/>Return explanation]
    B -->|Researchable| C[supervisor_plan<br/>Plan research questions]

    C --> D[dispatch_tasks<br/>Parallel execution]

    D --> E1[general_researcher]
    D --> E2[news_flow_agent]
    D --> E3[data_agent]

    E1 & E2 & E3 --> F[handle_meta_questions<br/>Spawn follow-ups?]

    F -->|New questions| D
    F -->|Done| G[aggregation_agent<br/>Synthesize + probabilities]
    G --> H[format_output<br/>Markdown / JSON report]
    H --> END([END])

    style START fill:#1e40af, color:white
    style END fill:#1e40af, color:white
    style B fill:#4338ca, color:white
    style F fill:#4338ca, color:white
    style Z fill:#991b1b, color:white
```

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
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   NEXT_PUBLIC_CONVEX_SITE_URL=<your-convex-site-url>

   MISTRAL_API_KEY=<your-mistral-key>
   FIRECRAWL_API_KEY=<your-firecrawl-key>
   ```

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
