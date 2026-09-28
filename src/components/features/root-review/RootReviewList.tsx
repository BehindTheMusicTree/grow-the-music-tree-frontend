"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import type { UnacceptedRoot } from "@schemas/api/genre-unaccepted-roots";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

const AcceptRootsInputSchema = z.object({ genres: z.array(z.object({ uuid: z.string() })) });

function UnacceptedRootRow({ root }: { root: UnacceptedRoot }) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema: AcceptRootsInputSchema,
    outputSchema: z.null(),
    mutationFn: (data) =>
      fetch("genres/unaccepted-roots/accept/", true, false, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => router.refresh(),
  });

  return (
    <section className="flex flex-col gap-1 rounded-md border p-4" aria-label={root.name}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-medium">{root.name}</span>
        {root.wikidataId && (
          <a
            href={`https://www.wikidata.org/wiki/${root.wikidataId}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {root.wikidataId}
          </a>
        )}
        <Button onClick={() => mutate({ genres: [{ uuid: root.uuid }] })} disabled={isPending}>
          Accept as root
        </Button>
      </div>
      {formErrors.map((error, index) => (
        <p key={index} className="text-red-500">
          {error.message}
        </p>
      ))}
    </section>
  );
}

export default function RootReviewList({ roots }: { roots: UnacceptedRoot[] }) {
  return (
    <div className="flex flex-col gap-4">
      {roots.map((root) => (
        <UnacceptedRootRow key={root.uuid} root={root} />
      ))}
    </div>
  );
}
