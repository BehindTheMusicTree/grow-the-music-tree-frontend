import Link from "next/link";
import { BookOpen, Compass, Headphones } from "lucide-react";
import { TipeeeSocialLinkColored } from "@behindthemusictree/brand/components";
import OrgSocialLinks from "@components/features/menu/OrgSocialLinks";
import { AboutTheMusicTreeLockup } from "@components/features/about/AboutTheMusicTreeLockup";
import { trackEvent } from "@lib/analytics";

const GITHUB_ORG_URL = "https://github.com/BehindTheMusicTree";
const GITHUB_AUDIOMETA_URL = "https://github.com/BehindTheMusicTree/audiometa";
const GITHUB_API_URL = "https://github.com/BehindTheMusicTree/grow-the-music-tree-api";
const WIKIDATA_URL = "https://www.wikidata.org";
const MUSICBRAINZ_URL = "https://musicbrainz.org";
const YOUTUBE_URL = "https://www.youtube.com";

const FEATURES = [
  {
    Icon: Compass,
    title: "Explore",
    description:
      "Navigate the genre tree and open any genre to see its summary, its essential songs and every song in its branch.",
  },
  {
    Icon: Headphones,
    title: "Listen",
    description: "Play a whole genre as a playlist and keep exploring while the music plays.",
  },
  {
    Icon: BookOpen,
    title: "Reference",
    description:
      "The genre tree follows Wikidata's music taxonomy, and every MusicBrainz song is kept, including those without a genre or a video yet.",
  },
];

const NEXT_ITEMS = [
  "Link songs that have no genre yet to the right branch of the tree",
  "See your own library, from Spotify or Google, on the map",
  "Help shape how genres are organized, together with the community",
  "HearTheMusicTree, a cloud audio manager for collectors and DJs",
];

const EXTERNAL_LINK_CLASS = "font-medium text-gray-900 underline-offset-2 hover:underline";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_CLASS}>
      {children}
    </a>
  );
}

export default function AboutContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-10 w-full max-w-2xl py-8 mx-auto">
      <header className="flex flex-col items-center gap-3 text-center">
        <AboutTheMusicTreeLockup />
        <p className="text-lg font-medium text-gray-700">The map of the world&apos;s music.</p>
        <p className="max-w-xl text-base leading-relaxed text-gray-600">
          Explore how genres branch out, listen as you go, and help build a reference that aims to classify every song.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 font-medium bg-blue-600 text-white rounded transition-colors hover:bg-blue-700"
        >
          TheMusicTree
        </button>
      </header>

      <section aria-label="What you can do" className="grid gap-6 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-2">
            <Icon aria-hidden="true" className="w-6 h-6 text-gray-900" />
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-600">{description}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-gray-900">What&apos;s next</h2>
        <ul className="pl-5 space-y-1.5 text-sm leading-relaxed text-gray-600 list-disc">
          {NEXT_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-gray-900">Support TheMusicTree</h2>
        <p className="text-sm leading-relaxed text-gray-600">
          TheMusicTree is independent and open source. If it helps you dig, support its growth.
        </p>
        <div>
          <TipeeeSocialLinkColored
            showText
            text="Support us on Tipeee"
            onClick={() => trackEvent("tipeee_click", { source: "about" })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 pt-6 border-t border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Built in the open</h2>
        <p className="text-sm leading-relaxed text-gray-600">
          TheMusicTree is made by <ExternalLink href={GITHUB_ORG_URL}>BehindTheMusicTree</ExternalLink>, an open-source
          team. Browse the <ExternalLink href={GITHUB_API_URL}>API</ExternalLink> and{" "}
          <ExternalLink href={GITHUB_AUDIOMETA_URL}>AudioMeta</ExternalLink>, our audio metadata library.
        </p>
        <OrgSocialLinks />
      </section>

      <footer className="flex flex-col items-center gap-1 text-xs text-center text-gray-400">
        <p>
          Genres from{" "}
          <a href={WIKIDATA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            Wikidata
          </a>{" "}
          · Song data from{" "}
          <a href={MUSICBRAINZ_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            MusicBrainz
          </a>{" "}
          · Playback via{" "}
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            YouTube
          </a>
        </p>
        <Link href="/admin" className="transition-colors hover:text-gray-600">
          Admin
        </Link>
      </footer>
    </div>
  );
}
