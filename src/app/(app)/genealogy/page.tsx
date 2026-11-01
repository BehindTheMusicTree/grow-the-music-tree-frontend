import { Suspense } from "react";
import Page from "@components/ui/Page";
import GenealogyView from "@components/features/genealogy/GenealogyView";

export default function GenealogyPage() {
  return (
    <Page title="Genealogy of music traditions" visuallyHiddenTitle dataPage="genealogy">
      {/* useSearchParams needs a Suspense boundary when the route is prerendered. */}
      <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-200" aria-busy />}>
        <GenealogyView />
      </Suspense>
    </Page>
  );
}
