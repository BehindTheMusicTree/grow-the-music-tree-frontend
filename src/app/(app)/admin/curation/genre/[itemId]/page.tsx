import { notFound, redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationBanner from "@components/features/curation/CurationBanner";
import CurationGenreRules from "@components/features/curation/CurationGenreRules";
import { auth } from "@lib/auth";
import { fetchCurationLists, fetchCurationRules } from "@lib/curation";
import { ITEM_ID_PATTERN } from "@schemas/api/curation";

type Props = { params: Promise<{ itemId: string }> };

export default async function CurationGenrePage({ params }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const itemId = decodeURIComponent((await params).itemId);
  if (!ITEM_ID_PATTERN.test(itemId)) notFound();

  const [lists, rules] = await Promise.all([fetchCurationLists(), fetchCurationRules(itemId)]);
  const name = rules.labels[itemId];

  return (
    <Page title={name ?? itemId} dataPage="admin-curation-genre">
      <div className="flex flex-col gap-4 p-4">
        <CurationBanner />
        <p className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="font-mono">{itemId}</span>
          {itemId.startsWith("Q") && (
            <a href={`https://www.wikidata.org/wiki/${itemId}`} target="_blank" rel="noreferrer" className="underline">
              Voir sur Wikidata
            </a>
          )}
        </p>
        <CurationGenreRules itemId={itemId} lists={lists} rules={rules} />
      </div>
    </Page>
  );
}
