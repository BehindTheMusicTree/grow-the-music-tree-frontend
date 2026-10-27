"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { useGenealogy } from "@hooks/useGenealogy";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CanonicalGenreSearchSchema } from "@schemas/api/curation";

const GenealogyChart = dynamic(() => import("./GenealogyChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />,
});

export default function GenealogyView() {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data, isPending, isError } = useGenealogy();
  const [opening, setOpening] = useState(false);

  const openInTree = async (wikidataId: string) => {
    if (opening) return;
    setOpening(true);
    try {
      const { results } = CanonicalGenreSearchSchema.parse(await fetch("genres/", true, false, {}, { wikidataId, pageSize: 1 }));
      const genre = results[0];
      if (!genre) {
        toast.error("This tradition is not in the genre tree yet");
        return;
      }
      router.push(`/?zoom=${genre.uuid}`);
    } finally {
      setOpening(false);
    }
  };

  if (isPending) return <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" aria-busy />;
  if (isError) return <p className="text-red-600">Could not load the genealogy.</p>;
  if (data === null) return <p className="text-gray-700">The genealogy has not been computed yet.</p>;
  return <GenealogyChart data={data} onOpenInTree={openInTree} />;
}
