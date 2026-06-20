import Link from "next/link";
import Page from "@components/ui/Page";
import { APP_NAME } from "@constants/app";
import OrgSocialLinks from "@components/features/menu/OrgSocialLinks";
import { AboutTheMusicTreeLockup } from "./AboutTheMusicTreeLockup";

const GITHUB_ORG_URL = "https://github.com/BehindTheMusicTree";
const GITHUB_AUDIOMETA_URL = "https://github.com/BehindTheMusicTree/audiometa";
const GITHUB_API_URL = "https://github.com/BehindTheMusicTree/the-music-tree-api";

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 text-center">{title}</h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

function EcosystemLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-100"
    >
      <span className="font-medium text-gray-900">{label}</span>
      <span className="text-gray-600"> — {description}</span>
    </a>
  );
}

export default function AboutPage() {
  return (
    <Page title="About" dataPage="about">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8 w-full">
        <p className="text-center text-base text-gray-600">
          <Link href="/" className="font-medium text-gray-900 hover:text-gray-600 transition-colors">
            {APP_NAME} 🌳
          </Link>{" "}
          — Explore how music genres connect and where your taste fits in.
        </p>

        <Section title="🎵 Overview">
          <p>
            {APP_NAME} helps you explore how music genres connect. Browse a map of genres that grows with the community,
            link your Spotify or Google account to see where your taste fits in, and discover new music along the way.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Browse and explore the genre tree</li>
            <li>Connect Spotify or sign in with Google to see your library on the map</li>
            <li>Get playlists and suggestions based on your taste</li>
            <li>Join in and help shape how genres are organized</li>
          </ul>
        </Section>

        <Section title="🌍 Part of BehindTheMusicTree">
          <AboutTheMusicTreeLockup />
          <p>
            This app is part of this ecosystem—a set of open-source projects aimed at building a shared reference for
            how we explore, understand, and organize music. The goal is a global map of music culture where your
            listening journey, your collection, and the community all fit together.
          </p>
          <p className="font-medium text-gray-800">Other projects in the ecosystem:</p>
          <div className="flex flex-col gap-2">
            <EcosystemLink
              href={GITHUB_AUDIOMETA_URL}
              label="🎵 AudioMeta"
              description="a library for reading and writing metadata in your audio files (MP3, FLAC, WAV, and more)"
            />
            <EcosystemLink
              href={GITHUB_API_URL}
              label="🔌 TheMusicTreeAPI"
              description="the backend that powers this app: genre data, recommendations, and your listening profile"
            />
            <EcosystemLink
              href={GITHUB_ORG_URL}
              label="🎧 HearTheMusicTree"
              description="a cloud audio manager for collectors and DJs: smart playlists, many formats, and sync across devices (in development)"
            />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-3 text-center text-sm text-gray-600">Follow BehindTheMusicTree and get in touch.</p>
            <OrgSocialLinks />
          </div>
        </Section>
      </div>
    </Page>
  );
}
