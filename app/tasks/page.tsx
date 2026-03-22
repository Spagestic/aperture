import { UserNav } from "./components/user-nav";
import { CompaniesTableClient } from "./components/companies-table-client";

export default function TaskPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            HKEX-listed coverage. Live prices from Yahoo Finance (may be delayed).
            Click a ticker or use the row menu to open documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
      <CompaniesTableClient />
    </div>
  );
}
