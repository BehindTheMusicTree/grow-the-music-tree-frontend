import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import ToRefineList from "@components/features/to-refine/ToRefineList";
import { auth } from "@lib/auth";

export default async function ToRefinePage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  return (
    <Page title="À affiner" dataPage="admin-to-refine">
      <div className="flex flex-col gap-4 p-4">
        <p>
          Ces chansons sont rattachées à un genre parapluie. Choisissez un sous-genre précis : elles quittent la liste
          dès qu&apos;elles en ont un.
        </p>
        <ToRefineList />
      </div>
    </Page>
  );
}
