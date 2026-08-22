import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/components/studio/StudioApp";

export const Route = createFileRoute("/studio/$bookId")({
  component: StudioRoute,
});

function StudioRoute() {
  const { bookId } = Route.useParams();
  return <StudioApp bookId={bookId} />;
}
