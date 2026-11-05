"use client";

import { GenreUuidSchema, useGenreByWikidataId } from "@behindthemusictree/app-kit/genre-tree";
import { GenreDetailPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { Button, DetailPanel, FieldList } from "@behindthemusictree/ui";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import type { Region } from "@schemas/api/region-map";

type Props = {
  region: Region;
  /** A genre picked inside the panel (family chip); it replaces the region's overview. */
  genreUuid: string | null;
  onSelectGenre: (genreUuid: string) => void;
  onFocus: (region: Region) => void;
  onClose: () => void;
};

export default function RegionDetailPanel({ region, genreUuid, onSelectGenre, onFocus, onClose }: Props) {
  const ownOverviewId = region.overviewItemId;
  const overviewId = ownOverviewId ?? region.inheritedOverviewItemId;
  const overview = useGenreByWikidataId(overviewId, "reference", getGrowBackendBaseUrl);
  const onZoomIn = region.drillable ? () => onFocus(region) : undefined;

  if (overviewId === null) {
    return (
      <DetailPanel title={region.name} onClose={onClose} side="left">
        <FieldList
          items={[
            { label: "Songs", value: region.songCount },
            { label: "Genres", value: region.genreCount },
          ]}
        />
        {onZoomIn && (
          <div className="px-6 py-4">
            <Button type="button" onClick={onZoomIn}>
              Focus on {region.name}
            </Button>
          </div>
        )}
      </DetailPanel>
    );
  }

  const picked = genreUuid === null ? null : GenreUuidSchema.safeParse(genreUuid);
  const uuid = picked?.success ? picked.data : overview.data?.uuid;

  if (!uuid) {
    const failed = overview.isError || overview.data === null;
    return (
      <DetailPanel title={region.name} onClose={onClose} side="left">
        {failed ? (
          <p role="alert" className="px-6 py-4 text-red-600">
            {ownOverviewId === null
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
      genreUuid={uuid}
      scope="reference"
      getBackendBaseUrl={getGrowBackendBaseUrl}
      onClose={onClose}
      onSelectGenre={onSelectGenre}
      onZoomIn={onZoomIn}
    />
  );
}
