import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationReviewList from "@components/features/curation-review/CurationReviewList";
import { auth } from "@lib/auth";
import { fetchCurationReview } from "@lib/curation";

export default async function CurationReviewPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const items = await fetchCurationReview();

  return (
    <Page title="Curation à revoir" dataPage="admin-curation-review">
      <div className="flex flex-col gap-4 p-4">
        <p>
          Éléments curés dont le QID Wikidata n&apos;a pas pu être remappé automatiquement par le pipeline. Corrigez-les
          dans la curation.
        </p>
        {items.length === 0 ? <p>Rien à revoir</p> : <CurationReviewList items={items} />}
      </div>
    </Page>
  );
}
