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
import { Chip } from "@behindthemusictree/ui";
import type { ArtistDetailed, ArtistLink } from "@schemas/api/artist";

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

interface ArtistLinkItem {
  key: string;
  url: string;
  Icon: ComponentType<{ className?: string }>;
  label: string;
}

export function artistLinks(artist: ArtistDetailed): ArtistLinkItem[] {
  const links = artist.links.map(({ kind, url }) => ({
    key: `${kind}-${url}`,
    url,
    Icon: LINK_KINDS[kind].Icon,
    label: kind === "social" ? socialLabel(url) : LINK_KINDS[kind].label,
  }));
  if (artist.musicbrainzArtistId) {
    links.push({
      key: "musicbrainz",
      url: `https://musicbrainz.org/artist/${artist.musicbrainzArtistId}`,
      Icon: SiMusicbrainz,
      label: "MusicBrainz",
    });
  }
  return links;
}

export default function ArtistLinks({ links }: { links: ArtistLinkItem[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {links.map(({ key, url, Icon, label }) => (
        <li key={key}>
          <Chip href={url} icon={<Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}>
            {label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
