// app/(main)/company/[id]/page.tsx
import { redirect } from "next/navigation";

export default async function CompanyRootPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  redirect(`/company/${id}/overview`);
}
