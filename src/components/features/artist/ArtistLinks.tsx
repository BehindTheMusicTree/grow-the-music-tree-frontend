import type { ComponentType } from "react";
import { Globe, Share2 } from "lucide-react";
import {
  SiBandcamp,
  SiDiscogs,
  SiMusicbrainz,
  SiSoundcloud,
  SiSpotify,
  SiWikidata,
  SiWikipedia,
  SiYoutube,
} from "react-icons/si";
import type { ArtistDetailed, ArtistLink } from "@schemas/api/artist";
import ArtistSection from "./ArtistSection";

const LINK_KINDS: Record<ArtistLink["kind"], { label: string; Icon: ComponentType<{ className?: string }> }> = {
  official: { label: "Official website", Icon: Globe },
  wikipedia: { label: "Wikipedia", Icon: SiWikipedia },
  wikidata: { label: "Wikidata", Icon: SiWikidata },
  spotify: { label: "Spotify", Icon: SiSpotify },
  youtube: { label: "YouTube", Icon: SiYoutube },
  bandcamp: { label: "Bandcamp", Icon: SiBandcamp },
  soundcloud: { label: "SoundCloud", Icon: SiSoundcloud },
  discogs: { label: "Discogs", Icon: SiDiscogs },
  social: { label: "Social", Icon: Share2 },
};

function socialLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return LINK_KINDS.social.label;
  }
}

export default function ArtistLinks({ artist }: { artist: ArtistDetailed }) {
  const links = artist.links.map(({ kind, url }) => ({
    url,
    Icon: LINK_KINDS[kind].Icon,
    label: kind === "social" ? socialLabel(url) : LINK_KINDS[kind].label,
  }));
  if (artist.musicbrainzArtistId) {
    links.push({
      url: `https://musicbrainz.org/artist/${artist.musicbrainzArtistId}`,
      Icon: SiMusicbrainz,
      label: "MusicBrainz",
    });
  }
  if (links.length === 0) return null;

  return (
    <ArtistSection title="Links">
      <ul className="flex flex-wrap gap-2">
        {links.map(({ url, Icon, label }) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </ArtistSection>
  );
}
