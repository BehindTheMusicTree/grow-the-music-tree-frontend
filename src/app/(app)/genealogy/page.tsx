import Page from "@components/ui/Page";
import GenealogyView from "@components/features/genealogy/GenealogyView";

export default function GenealogyPage() {
  return (
    <Page title="Genealogy of music traditions" dataPage="genealogy">
      <div className="h-[calc(100dvh-12rem)] min-h-96">
        <GenealogyView />
      </div>
    </Page>
  );
}
