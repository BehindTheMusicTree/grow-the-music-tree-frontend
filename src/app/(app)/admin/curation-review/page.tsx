import { redirect } from "next/navigation";
import { Page } from "@behindthemusictree/ui";
import CurationReviewList from "@components/features/curation-review/CurationReviewList";
import { auth } from "@lib/auth";
import { fetchCurationReview } from "@lib/curation";

export default async function CurationReviewPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const items = await fetchCurationReview();

  return (
    <Page title="Curation à revoir" data-page="admin-curation-review">
      <div className="flex flex-col gap-4 p-4">
        <p>
          Règles signalées par le pipeline. L’exposition indique combien de chansons portent le tag à chaque niveau.
        </p>
        {items.length === 0 ? <p>Rien à revoir</p> : <CurationReviewList items={items} />}
      </div>
    </Page>
  );
}
