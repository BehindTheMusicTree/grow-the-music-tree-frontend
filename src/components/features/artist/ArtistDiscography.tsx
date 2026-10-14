import type { ArtistAlbum } from "@schemas/api/artist";
import ArtistSection from "./ArtistSection";

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
    <ArtistSection title="Discography">
      {GROUPS.map((group) => {
        const groupAlbums = sorted.filter((album) => discographyGroup(album) === group);
        if (groupAlbums.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">{group}</h3>
            <ul className="flex flex-col gap-0.5">
              {groupAlbums.map((album) => (
                <li key={album.uuid} className="flex gap-3">
                  <span className="w-10 shrink-0 tabular-nums text-gray-500">{album.year ?? "—"}</span>
                  <span className="text-gray-900">{album.name}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </ArtistSection>
  );
}
