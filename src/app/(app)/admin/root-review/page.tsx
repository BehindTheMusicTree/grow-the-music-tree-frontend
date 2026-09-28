import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import RootReviewList from "@components/features/root-review/RootReviewList";
import { auth } from "@lib/auth";
import { fetchUnacceptedRoots } from "@lib/genre-unaccepted-roots";

export default async function RootReviewPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const roots = await fetchUnacceptedRoots();

  return (
    <Page title="Root review" dataPage="admin-root-review">
      <div className="flex flex-col gap-4 p-4">
        <p>
          These top-level genres are not in the pipeline&apos;s accepted-roots list. Accept the ones that are legitimate
          roots. To give one a parent instead, triage it in the pipeline.
        </p>
        {roots.length === 0 ? <p>No roots to review</p> : <RootReviewList roots={roots} />}
      </div>
    </Page>
  );
}
