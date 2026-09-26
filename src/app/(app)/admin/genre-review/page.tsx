import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import GenreReviewList from "@components/features/genre-review/GenreReviewList";
import { auth } from "@lib/auth";
import { fetchGenreNameConflicts } from "@lib/genre-name-conflicts";

export default async function GenreReviewPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { results } = await fetchGenreNameConflicts();

  return (
    <Page title="Genre review" dataPage="admin-genre-review">
      <div className="flex flex-col gap-4 p-4">
        <p>
          These genres were imported with a name already taken by another genre. Rename each one to a distinct name.
        </p>
        {results.length === 0 ? <p>No genres to review</p> : <GenreReviewList genres={results} />}
      </div>
    </Page>
  );
}
