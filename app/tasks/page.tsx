import { UserNav } from "./components/user-nav";
import { CompaniesTableClient } from "./components/companies-table-client";
import { loadSecurities } from "./lib/load-securities";

export default async function TaskPage() {
  const securities = await loadSecurities();

  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            HKEX securities
          </h2>
          <p className="text-muted-foreground">
            Coverage sourced from{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              ListOfSecurities.json
            </code>
            . Click a ticker or use the row menu to open documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
      <CompaniesTableClient securities={securities} />
    </div>
  );
}
