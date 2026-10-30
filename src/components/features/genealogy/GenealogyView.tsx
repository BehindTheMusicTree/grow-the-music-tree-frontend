"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { useGenealogy } from "@hooks/useGenealogy";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CanonicalGenreSearchSchema } from "@schemas/api/curation";
import TraditionDetailPanel from "./TraditionDetailPanel";

const TRADITION_PARAM = "tradition";

const GenealogyChart = dynamic(() => import("./GenealogyChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />,
});

export default function GenealogyView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data, isPending, isError } = useGenealogy();
  const [opening, setOpening] = useState(false);

  const requestedId = searchParams.get(TRADITION_PARAM);
  const selected = useMemo(
    () => data?.traditions.find((tradition) => tradition.wikidataId === requestedId) ?? null,
    [data, requestedId],
  );

  const setSelectedId = useCallback(
    (id: string | null, method: "push" | "replace" = "push") => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === null) params.delete(TRADITION_PARAM);
      else params.set(TRADITION_PARAM, id);
      const query = params.toString();
      router[method](query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router],
  );

  useEffect(() => {
    if (data && requestedId !== null && !selected) setSelectedId(null, "replace");
  }, [data, requestedId, selected, setSelectedId]);

  useEffect(() => {
    if (!selected) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, setSelectedId]);

  useEffect(() => {
    if (selected) return undefined;
    const root = document.documentElement;
    root.style.setProperty("--layout-left-w", "0px");
    return () => {
      root.style.removeProperty("--layout-left-w");
    };
  }, [selected]);

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

  if (isPending) return <div className="h-full w-full animate-pulse bg-gray-200" aria-busy />;
  if (isError) return <p className="text-red-600">Could not load the genealogy.</p>;
  if (data === null) return <p className="text-gray-700">The genealogy has not been computed yet.</p>;
  return (
    <div className="relative h-full w-full">
      <GenealogyChart data={data} selectedId={selected?.wikidataId ?? null} onSelect={setSelectedId} />
      {selected && (
        <TraditionDetailPanel
          data={data}
          tradition={selected}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
          onOpenInTree={openInTree}
        />
      )}
    </div>
  );
}
