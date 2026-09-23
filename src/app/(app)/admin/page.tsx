import { Button } from "@behindthemusictree/ui";
import Page from "@components/ui/Page";
import { auth, signIn, signOut } from "@lib/auth";

export default async function AdminPage() {
  const session = await auth();
  const isSignedIn = !!session && !session.error;

  return (
    <Page title="Admin" dataPage="admin">
      <div className="flex flex-col items-start gap-4 p-4">
        {isSignedIn ? (
          <>
            <p>Signed in as {session.user?.email}</p>
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
