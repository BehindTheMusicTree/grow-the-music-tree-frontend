import Link from "next/link";
import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationBanner from "@components/features/curation/CurationBanner";
import { auth } from "@lib/auth";
import { fetchCurationLists } from "@lib/curation";

export default async function CurationPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const lists = await fetchCurationLists();

  return (
    <Page title="Curation" dataPage="admin-curation">
      <div className="flex flex-col gap-4 p-4">
        <CurationBanner />
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.name}>
              <Link href={`/admin/curation/${list.name}`} className="font-medium underline">
                {list.name}
              </Link>
              <p>{list.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
