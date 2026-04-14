// app/(main)/layout.tsx
import { SiteHeader } from "@/components/site-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
