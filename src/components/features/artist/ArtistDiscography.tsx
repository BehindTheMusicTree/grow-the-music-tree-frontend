import type { ArtistAlbum } from "@schemas/api/artist";
import { PanelSection } from "@behindthemusictree/ui";

const GROUPS = ["Albums", "EPs", "Singles", "Live", "Compilations", "Other"] as const;
type Group = (typeof GROUPS)[number];

const PRIMARY_GROUPS: Record<string, Group> = { album: "Albums", ep: "EPs", single: "Singles" };

// Secondary types win over the primary one: a live album belongs with live releases, not studio albums.
export function discographyGroup({ primaryType, secondaryTypes }: ArtistAlbum): Group {
  const secondary = secondaryTypes.map((type) => type.toLowerCase());
  if (secondary.includes("live")) return "Live";
  if (secondary.includes("compilation")) return "Compilations";
  return PRIMARY_GROUPS[primaryType?.toLowerCase() ?? ""] ?? "Other";
}

function byYear(a: ArtistAlbum, b: ArtistAlbum): number {
  if (a.year !== b.year) {
    if (a.year === null) return 1;
    if (b.year === null) return -1;
    return a.year.localeCompare(b.year);
  }
  return a.name.localeCompare(b.name);
}

export default function ArtistDiscography({ albums }: { albums: ArtistAlbum[] }) {
  if (albums.length === 0) return null;
  const sorted = [...albums].sort(byYear);

  return (
    <PanelSection title="Discography">
      {GROUPS.map((group) => {
        const groupAlbums = sorted.filter((album) => discographyGroup(album) === group);
        if (groupAlbums.length === 0) return null;
        return (
          <div key={group} className="mt-2.5 first:mt-0">
            <h4 className="text-xs font-medium text-[var(--color-text-muted)]">{group}</h4>
            <ul className="mt-0.5">
              {groupAlbums.map((album) => (
                <li key={album.uuid} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 py-0.5">
                  <span className="tabular-nums text-[var(--color-text-muted)]">{album.year ?? "—"}</span>
                  <span className="truncate text-[var(--color-text)]" title={album.name}>
                    {album.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </PanelSection>
  );
}
