import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import GenreReviewList from "@components/features/genre-review/GenreReviewList";
import { auth } from "@lib/auth";
import { fetchGenreNameConflictGroups } from "@lib/genre-name-conflicts";

export default async function GenreReviewPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const groups = await fetchGenreNameConflictGroups();

  return (
    <Page title="Genre review" dataPage="admin-genre-review">
      <div className="flex flex-col gap-4 p-4">
        <p>
          Each group holds genres sharing a name. Edit any names that should differ, then Validate the group — names
          left unchanged are kept as they are.
        </p>
        {groups.length === 0 ? <p>No genres to review</p> : <GenreReviewList groups={groups} />}
      </div>
    </Page>
  );
}
