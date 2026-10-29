import { Button } from "@behindthemusictree/ui";
import Page from "@components/ui/Page";
import Link from "next/link";
import { auth, signIn, signOut } from "@lib/auth";
import { fetchGenreNameConflictGroups } from "@lib/genre-name-conflicts";
import { fetchUnacceptedRoots } from "@lib/genre-unaccepted-roots";

const SIGN_IN_ERRORS: Record<string, string> = {
  AccessDenied: "This account isn't allowed to sign in. Only admin accounts can.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const session = await auth();
  const isSignedIn = !!session && !session.error;
  // A grow-api outage must not take down sign-in/sign-out: show the link without a count.
  const conflictCount = isSignedIn
    ? await fetchGenreNameConflictGroups().then(
        (groups) => groups.length,
        () => null,
      )
    : null;
  const rootCount = isSignedIn
    ? await fetchUnacceptedRoots().then(
        (roots) => roots.length,
        () => null,
      )
    : null;

  return (
    <Page title="Admin" dataPage="admin">
      <div className="flex flex-col items-start gap-4 p-4">
        {isSignedIn ? (
          <>
            <p>Signed in as {session.user?.email}</p>
            <Link href="/admin/genre-review" className="font-medium underline">
              Genre review{conflictCount === null ? "" : ` (${conflictCount})`}
            </Link>
            <Link href="/admin/root-review" className="font-medium underline">
              Root review{rootCount === null ? "" : ` (${rootCount})`}
            </Link>
            <Link href="/admin/curation" className="font-medium underline">
              Curation
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
          <>
            {error && (
              <p role="alert" className="text-red-600">
                {SIGN_IN_ERRORS[error] ?? "Sign-in failed. Please try again."}
              </p>
            )}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/admin" });
              }}
            >
              <Button type="submit">Sign in with Google</Button>
            </form>
          </>
        )}
      </div>
    </Page>
  );
}
