"use client";

import { useMemo } from "react";
import { Button, DetailPanel, FieldList, PanelSection } from "@behindthemusictree/ui";
import type { Genealogy, GenealogyTradition } from "@schemas/api/genealogy";
import { formatSpan } from "./format";

type Props = {
  data: Genealogy;
  tradition: GenealogyTradition;
  onSelect: (wikidataId: string) => void;
  onClose: () => void;
  onOpenInTree: (wikidataId: string) => void;
};

export default function TraditionDetailPanel({ data, tradition, onSelect, onClose, onOpenInTree }: Props) {
  const { wikidataId, label, start, end, anchorId, inCanonicalTree } = tradition;

  const anchorLabel = useMemo(() => {
    if (anchorId === null) return null;
    const lane = data.columns.flatMap((column) => column.lanes).find((entry) => entry.entityId === anchorId);
    return lane?.label ?? data.bands.find((band) => band.entityId === anchorId)?.label ?? null;
  }, [data, anchorId]);

  const related = useMemo(() => {
    const byId = new Map(data.traditions.map((entry) => [entry.wikidataId, entry]));
    const pick = (ids: string[]) => ids.flatMap((id) => byId.get(id) ?? []);
    const links = data.traditionLinks;
    return {
      from: pick(links.filter((link) => link.kind === "lineage" && link.targetId === wikidataId).map((link) => link.sourceId)),
      to: pick(links.filter((link) => link.kind === "lineage" && link.sourceId === wikidataId).map((link) => link.targetId)),
      associated: pick(
        links
          .filter((link) => link.kind === "association" && (link.sourceId === wikidataId || link.targetId === wikidataId))
          .map((link) => (link.sourceId === wikidataId ? link.targetId : link.sourceId)),
      ),
    };
  }, [data, wikidataId]);

  const sections = [
    { title: "Descends from", items: related.from },
    { title: "Leads to", items: related.to },
    { title: "Associated with", items: related.associated },
  ];

  return (
    <DetailPanel title={label} onClose={onClose} side="left">
      <FieldList
        items={[
          { label: "Period", value: formatSpan(start, end) },
          ...(anchorLabel ? [{ label: "Anchor", value: anchorLabel }] : []),
          {
            label: "Wikidata",
            value: (
              <a
                href={`https://www.wikidata.org/wiki/${wikidataId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-link)] underline"
              >
                {wikidataId}
              </a>
            ),
          },
        ]}
      />
      {sections.map(({ title, items }) =>
        items.length === 0 ? null : (
          <PanelSection key={title} title={title}>
            {items.map((item) => (
              <button
                key={item.wikidataId}
                type="button"
                onClick={() => onSelect(item.wikidataId)}
                className="block w-full py-2 text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
              >
                {item.label}
              </button>
            ))}
          </PanelSection>
        ),
      )}
      {inCanonicalTree && (
        <div className="px-6 py-4">
          <Button type="button" onClick={() => onOpenInTree(wikidataId)}>
            Open in genre tree
          </Button>
        </div>
      )}
    </DetailPanel>
  );
}
