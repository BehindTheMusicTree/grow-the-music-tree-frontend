"use client";

import { useGenreByWikidataId } from "@behindthemusictree/app-kit/genre-tree";
import { GenreDetailPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { Button, DetailPanel, FieldList } from "@behindthemusictree/ui";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { collapseEdgeTab } from "@utils/collapseEdgeTab";
import type { Region } from "@schemas/api/region-map";
import { useRegionOverview } from "./useRegionOverview";

type Props = {
  region: Region;
  onSelectGenre: (genreUuid: string) => void;
  onZoomTo: (region: Region) => void;
  onClose: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export default function RegionDetailPanel({
  region,
  onSelectGenre,
  onZoomTo,
  onClose,
  collapsed,
  onCollapsedChange,
}: Props) {
  const { overviewId, uuid, failed } = useRegionOverview(region);
  const edgeTab = collapseEdgeTab(collapsed, onCollapsedChange);
  const onZoomIn = region.drillable && region.boundaryStatus !== "missing" ? () => onZoomTo(region) : undefined;

  if (overviewId === null && !uuid) {
    return (
      <DetailPanel titleInSearch title={region.name} onClose={onClose} side="left" collapsed={collapsed} edgeTab={edgeTab}>
        <FieldList
          items={[
            { label: "Songs", value: region.songCount },
            { label: "Genres", value: region.genreCount },
          ]}
        />
        <ul className="flex flex-col gap-3 px-6 py-4" aria-label="Region genres">
          {region.genres
            .filter((genre) => genre.relation !== "tradition")
            .map((genre) => (
              <RegionGenreChoice key={genre.itemId} itemId={genre.itemId} onSelect={onSelectGenre} />
            ))}
        </ul>
        {onZoomIn && (
          <div className="px-6 py-4">
            <Button type="button" onClick={onZoomIn}>
              Zoom to {region.name}
            </Button>
          </div>
        )}
      </DetailPanel>
    );
  }

  if (!uuid) {
    return (
      <DetailPanel titleInSearch title={region.name} onClose={onClose} side="left" collapsed={collapsed} edgeTab={edgeTab}>
        {failed ? (
          <p role="alert" className="px-6 py-4 text-red-600">
            {region.overviewItemId === null
              ? `The music genre covering ${region.name} could not be loaded.`
              : `The genre “Music of ${region.name}” could not be loaded.`}
          </p>
        ) : (
          <div className="m-6 h-24 animate-pulse rounded bg-gray-200" aria-busy />
        )}
      </DetailPanel>
    );
  }

  return (
    <GenreDetailPanel
      titleInSearch
      genreUuid={uuid}
      scope="reference"
      getBackendBaseUrl={getGrowBackendBaseUrl}
      onClose={onClose}
      onSelectGenre={onSelectGenre}
      onZoomIn={onZoomIn}
      collapsed={collapsed}
      edgeTab={edgeTab}
    />
  );
}

function RegionGenreChoice({ itemId, onSelect }: { itemId: string; onSelect: (uuid: string) => void }) {
  const genre = useGenreByWikidataId(itemId, "reference", getGrowBackendBaseUrl);
  if (genre.isError || genre.data === null) return <li>Genre {itemId} is unavailable.</li>;
  if (!genre.data) return <li aria-busy>Loading genre…</li>;
  const resolved = genre.data;
  return (
    <li>
      <Button type="button" onClick={() => onSelect(resolved.uuid)}>
        {resolved.name}
      </Button>
    </li>
  );
}
