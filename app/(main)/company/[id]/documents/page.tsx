"use client";

import { useParams } from "next/navigation";
import { CompanyDocumentsClient } from "./company-documents-client";

export default function CompanyDocumentsPage() {
  const params = useParams<{ id: string }>();
  const idValue = params?.id || "0700.HK"; // Fallback to Tencent just in case
  const ticker = idValue.length <= 5 ? idValue.toUpperCase() : idValue;

  return <CompanyDocumentsClient ticker={ticker} />;
}
