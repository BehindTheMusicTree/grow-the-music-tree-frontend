import { Button } from "@behindthemusictree/ui";
import Page from "@components/ui/Page";
import Link from "next/link";
import { auth, signIn, signOut } from "@lib/auth";
import { fetchGenreNameConflicts } from "@lib/genre-name-conflicts";

export default async function AdminPage() {
  const session = await auth();
  const isSignedIn = !!session && !session.error;
  const conflictCount = isSignedIn ? (await fetchGenreNameConflicts()).count : 0;

  return (
    <Page title="Admin" dataPage="admin">
      <div className="flex flex-col items-start gap-4 p-4">
        {isSignedIn ? (
          <>
            <p>Signed in as {session.user?.email}</p>
            <Link href="/admin/genre-review" className="font-medium underline">
              Genre review ({conflictCount})
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <Button type="submit">Sign out</Button>
            </form>
          </>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
          >
            <Button type="submit">Sign in with Google</Button>
          </form>
        )}
      </div>
    </Page>
  );
}
