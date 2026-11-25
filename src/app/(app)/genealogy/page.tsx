import { Suspense } from "react";
import { Page } from "@behindthemusictree/ui";
import GenealogyView from "@components/features/genealogy/GenealogyView";

export default function GenealogyPage() {
  return (
    <Page title="Genealogy of music traditions" layout="canvas" visuallyHiddenTitle data-page="genealogy">
      {/* useSearchParams needs a Suspense boundary when the route is prerendered. */}
      <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-200" aria-busy />}>
        <GenealogyView />
      </Suspense>
    </Page>
  );
}
