import { Suspense } from "react";
import { EventPageContent } from "./_components/event-page-content";
import { EventPageSkeleton } from "./_components/event-page-skeleton";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventPageContent slug={slug} />
    </Suspense>
  );
}
