import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const GITHUB_REPO_URL = "https://github.com/BehindTheMusicTree/grow-the-music-tree";
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
    <section
      className={`flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}
    >
      <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 text-center">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

function EcosystemLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
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
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="flex flex-col gap-6 max-w-2xl py-8">
      <header className="flex flex-col gap-2 pb-2 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          About{" "}
          <Link href="/" className="text-gray-900 hover:text-gray-600 transition-colors">
            Grow the Music Tree 🌳
          </Link>
        </h1>
        <p className="text-base text-gray-600">
          Explore how music genres connect and where your taste fits in.
        </p>
      </header>

      <Section title="🎵 Overview">
        <p>
          Grow the Music Tree helps you explore how music genres connect. Browse a map of genres that
          grows with the community, link your Spotify or Google account to see where your taste
          fits in, and discover new music along the way.
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Browse and explore the genre tree</li>
          <li>Connect Spotify or sign in with Google to see your library on the map</li>
          <li>Get playlists and suggestions based on your taste</li>
          <li>Join in and help shape how genres are organized</li>
        </ul>
      </Section>

      <Section title="🌍 Part of BehindTheMusicTree">
        <p>
          This app is part of the{" "}
          <a
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            BehindTheMusicTree
          </a>{" "}
          ecosystem—a set of open-source projects aimed at building a shared reference for how we
          explore, understand, and organize music. The goal is a global map of music culture where
          your listening journey, your collection, and the community all fit together.
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
            label="🔌 The Music Tree API"
            description="the backend that powers this app: genre data, recommendations, and your listening profile"
          />
          <EcosystemLink
            href={GITHUB_ORG_URL}
            label="🎧 HearTheMusicTree"
            description="a cloud audio manager for collectors and DJs: smart playlists, many formats, and sync across devices (in development)"
          />
        </div>
      </Section>

      <Section title="🐙 GitHub">
        <div className="flex flex-col gap-3">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-fit px-5 py-2.5 text-base font-medium text-white bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <FaGithub className="text-xl" />
            View this project on GitHub
          </a>
          <p className="text-sm text-gray-600">
            Explore the rest of the ecosystem at{" "}
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              github.com/BehindTheMusicTree
            </a>
          </p>
        </div>
      </Section>

      {contactEmail && (
        <Section title="✉️ Contact">
          <a
            href={`mailto:${contactEmail}`}
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            {contactEmail}
          </a>
        </Section>
      )}
    </div>
  );
}
