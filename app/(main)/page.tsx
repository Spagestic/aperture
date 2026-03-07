import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Newspaper,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Tone = "up" | "down" | "neutral";

const marketPulse: {
  label: string;
  value: string;
  change: string;
  tone: Tone;
  note: string;
}[] = [
  {
    label: "S&P 500",
    value: "5,117.40",
    change: "-0.82%",
    tone: "down",
    note: "US equities",
  },
  {
    label: "Nasdaq",
    value: "16,014.22",
    change: "-1.10%",
    tone: "down",
    note: "Growth stocks",
  },
  {
    label: "HSI",
    value: "17,245.10",
    change: "+0.45%",
    tone: "up",
    note: "Hong Kong",
  },
  {
    label: "US 10Y",
    value: "4.21%",
    change: "+4 bps",
    tone: "up",
    note: "Treasury yield",
  },
  {
    label: "WTI Oil",
    value: "$90.90",
    change: "+1.80%",
    tone: "up",
    note: "Energy",
  },
  {
    label: "BTC",
    value: "$68,000",
    change: "-2.30%",
    tone: "down",
    note: "Crypto",
  },
];

const dailyBrief = [
  "Fed signals slower cuts; growth names trade lower into the close.",
  "Crude rises on shipping risk, lifting energy names across US and Europe.",
  "HK tech rebounds after stronger-than-expected ad spending and cloud demand data.",
];

const upcoming = [
  { day: "Tue", title: "NVDA earnings call", meta: "After market close" },
  { day: "Wed", title: "AAPL annual meeting", meta: "10:00 AM EST" },
  { day: "Fri", title: "TSM ex-dividend date", meta: "Cash dividend" },
  { day: "Mon", title: "Tencent monthly return", meta: "HKEX filing" },
];

const watchlist: {
  company: string;
  ticker: string;
  price: string;
  change: string;
  tone: Tone;
  marketCap: string;
  pe: string;
  nextEvent: string;
  unread: number;
}[] = [
  {
    company: "Apple",
    ticker: "AAPL",
    price: "$257.46",
    change: "-1.09%",
    tone: "down",
    marketCap: "$3.9T",
    pe: "31.2",
    nextEvent: "Earnings · May 02",
    unread: 2,
  },
  {
    company: "Microsoft",
    ticker: "MSFT",
    price: "$408.96",
    change: "-0.42%",
    tone: "down",
    marketCap: "$3.0T",
    pe: "35.8",
    nextEvent: "Build keynote · Jun 14",
    unread: 1,
  },
  {
    company: "NVIDIA",
    ticker: "NVDA",
    price: "$177.82",
    change: "-3.01%",
    tone: "down",
    marketCap: "$4.3T",
    pe: "62.1",
    nextEvent: "Earnings · Tomorrow",
    unread: 4,
  },
  {
    company: "Tencent",
    ticker: "0700.HK",
    price: "HK$378.20",
    change: "+1.22%",
    tone: "up",
    marketCap: "HK$3.5T",
    pe: "19.4",
    nextEvent: "Monthly return · Mon",
    unread: 1,
  },
  {
    company: "TSMC",
    ticker: "TSM",
    price: "$142.18",
    change: "+0.67%",
    tone: "up",
    marketCap: "$737B",
    pe: "27.6",
    nextEvent: "Ex-dividend · Fri",
    unread: 0,
  },
];

const latestFilings = [
  {
    company: "Apple",
    ticker: "AAPL",
    type: "10-K",
    note: "New annual report parsed and key financials extracted.",
    when: "14 minutes ago",
  },
  {
    company: "NVIDIA",
    ticker: "NVDA",
    type: "8-K",
    note: "Management commentary and guidance update available.",
    when: "37 minutes ago",
  },
  {
    company: "TSMC",
    ticker: "TSM",
    type: "Investor Presentation",
    note: "Quarterly deck and capex highlights added.",
    when: "1 hour ago",
  },
  {
    company: "Tencent",
    ticker: "0700.HK",
    type: "HKEX Filing",
    note: "Monthly return posted and archived in documents.",
    when: "2 hours ago",
  },
];

const lastVisitUpdates = [
  {
    title: "Microsoft announced new enterprise pricing tiers",
    meta: "Press release · MSFT",
  },
  {
    title: "NVIDIA guided above consensus for datacenter revenue",
    meta: "Earnings preview · NVDA",
  },
  {
    title: "Tencent filed monthly return on HKEX",
    meta: "Official filing · 0700.HK",
  },
  {
    title: "Apple buyback discussion surfaced across major desks",
    meta: "News digest · AAPL",
  },
];

const earningsNews = [
  "Apple expands buyback authorization ahead of next earnings release.",
  "NVIDIA suppliers raise delivery targets after stronger AI server demand.",
  "TSMC sees improved utilization in advanced node production.",
];

const productsNews = [
  "Microsoft adds new enterprise Copilot features for finance teams.",
  "Alibaba Cloud launches a lighter AI model for regional deployment.",
  "Tesla refreshes software stack for fleet energy optimization.",
];

const regulationNews = [
  "EU opens a new review into app store payment practices.",
  "US export controls remain the key swing factor for advanced chips.",
  "HK regulators propose tighter disclosure timing for material updates.",
];

const managementNews = [
  "New CFO appointment sparks margin focus at a mid-cap SaaS name.",
  "Board reshuffle signals governance cleanup after activist pressure.",
  "Investor relations team changes often precede messaging resets.",
];

function ChangeBadge({ tone, value }: { tone: Tone; value: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full px-2.5 py-1 text-xs",
        tone === "up" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        tone === "down" &&
          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        tone === "neutral" &&
          "border-muted-foreground/20 bg-muted text-muted-foreground",
      )}
    >
      {tone === "up" ? (
        <ArrowUpRight className="size-3" />
      ) : tone === "down" ? (
        <ArrowDownRight className="size-3" />
      ) : null}
      {value}
    </Badge>
  );
}

function NewsList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item}>
          {index > 0 && <Separator className="mb-3" />}
          <div className="flex items-start gap-3">
            <Newspaper className="mt-0.5 size-4 text-muted-foreground" />
            <p className="text-sm leading-6">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {marketPulse.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-3">
              <CardDescription>{item.label}</CardDescription>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-2xl">{item.value}</CardTitle>
                <ChangeBadge tone={item.tone} value={item.change} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <CardTitle>Daily brief</CardTitle>
            </div>
            <CardDescription>
              The fastest read on what changed across your coverage universe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyBrief.map((item, index) => (
              <div key={item}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 rounded-full">
                    {index + 1}
                  </Badge>
                  <p className="text-sm leading-6">{item}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <CardTitle>Upcoming</CardTitle>
            </div>
            <CardDescription>
              Events worth checking before the next session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.map((item, index) => (
              <div key={`${item.day}-${item.title}`}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {item.day}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Watchlist snapshot</CardTitle>
              <CardDescription>
                Quick view across your most important companies.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Manage watchlist
            </Button>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Company</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>1D</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Market cap
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">P/E</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Next event
                  </TableHead>
                  <TableHead className="pr-6 text-right">Unread</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.ticker}>
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-medium">{item.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.ticker}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <ChangeBadge tone={item.tone} value={item.change} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.marketCap}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.pe}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.nextEvent}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {item.unread > 0 ? (
                        <Badge variant="secondary" className="rounded-full">
                          {item.unread}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Latest filings</CardTitle>
            <CardDescription>
              Newly indexed reports, releases, and official documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestFilings.map((item) => (
              <div
                key={`${item.ticker}-${item.type}`}
                className="rounded-xl border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {item.company}{" "}
                        <span className="text-muted-foreground">
                          · {item.ticker}
                        </span>
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {item.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.when}</p>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Since your last visit</CardTitle>
            <CardDescription>
              Personalized updates from followed companies and saved searches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastVisitUpdates.map((item, index) => (
              <div key={item.title}>
                {index > 0 && <Separator className="mb-4" />}
                <div>
                  <p className="text-sm font-medium leading-6">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>News by category</CardTitle>
            <CardDescription>
              Grouped headlines that connect better with company research.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earnings" className="w-full">
              <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start">
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="regulation">Regulation</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
              </TabsList>

              <TabsContent value="earnings" className="mt-0">
                <NewsList items={earningsNews} />
              </TabsContent>
              <TabsContent value="products" className="mt-0">
                <NewsList items={productsNews} />
              </TabsContent>
              <TabsContent value="regulation" className="mt-0">
                <NewsList items={regulationNews} />
              </TabsContent>
              <TabsContent value="management" className="mt-0">
                <NewsList items={managementNews} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ask Aperture</CardTitle>
          <CardDescription>
            Query filings, compare companies, or ask for a quick summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">
              Summarize today&apos;s filings
            </Button>
            <Button variant="secondary" size="sm">
              Compare AAPL vs MSFT
            </Button>
            <Button variant="secondary" size="sm">
              What changed in my watchlist?
            </Button>
          </div>

          <Textarea
            placeholder="Ask anything about your watchlist, filings, annual reports, or company news..."
            className="min-h-28 resize-none"
          />

          <div className="mt-3 flex justify-end">
            <Button>Run query</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
