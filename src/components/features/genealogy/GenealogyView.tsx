"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useGenreByWikidataId } from "@behindthemusictree/app-kit/genre-tree";
import { useLeftDetailPanelLayout } from "@behindthemusictree/app-kit-ui/genre-tree";
import { useGenealogy } from "@hooks/useGenealogy";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
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
  const { data, isPending, isError } = useGenealogy();
  const [openingQid, setOpeningQid] = useState<string | null>(null);
  const lookup = useGenreByWikidataId(openingQid, "reference", getGrowBackendBaseUrl);

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

  useLeftDetailPanelLayout(selected !== null);

  const lookedUp = lookup.data;
  const lookupFailed = lookup.isError;
  useEffect(() => {
    if (openingQid === null || (lookedUp === undefined && !lookupFailed)) return;
    setOpeningQid(null);
    if (lookedUp) router.push(`/?zoom=${lookedUp.uuid}`);
    else toast.error(lookupFailed ? "Could not look up this tradition" : "This tradition is not in the genre tree yet");
  }, [openingQid, lookedUp, lookupFailed, router]);

  const openInTree = (wikidataId: string) => {
    if (openingQid === null) setOpeningQid(wikidataId);
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
