import { FaGithub } from "react-icons/fa";

const GITHUB_REPO_URL = "https://github.com/BehindTheMusicTree/grow-the-music-tree";
const GITHUB_ORG_URL = "https://github.com/BehindTheMusicTree";
const GITHUB_AUDIOMETA_URL = "https://github.com/BehindTheMusicTree/audiometa";
const GITHUB_API_URL = "https://github.com/BehindTheMusicTree/the-music-tree-api";

export default function AboutPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="flex flex-col gap-8 max-w-2xl py-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">About Grow the Music Tree</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-gray-800">Overview</h2>
        <p className="text-base leading-relaxed text-gray-700">
          Grow the Music Tree helps you explore how music genres connect. Browse a map of genres that grows with the
          community, link your Spotify or Google account to see where your taste fits in, and discover new music along
          the way.
        </p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
          <li>Browse and explore the genre tree</li>
          <li>Connect Spotify or sign in with Google to see your library on the map</li>
          <li>Get playlists and suggestions based on your taste</li>
          <li>Join in and help shape how genres are organized</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-gray-800">Part of BehindTheMusicTree</h2>
        <p className="text-base leading-relaxed text-gray-700">
          This app is part of the{" "}
          <a
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            BehindTheMusicTree
          </a>{" "}
          ecosystem—a set of open-source projects aimed at building a shared reference for how we explore, understand,
          and organize music. The goal is a global map of music culture where your listening journey, your collection,
          and the community all fit together.
        </p>
        <p className="text-base leading-relaxed text-gray-700">Other projects in the ecosystem:</p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
          <li>
            <a
              href={GITHUB_AUDIOMETA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              AudioMeta
            </a>{" "}
            — a library for reading and writing metadata in your audio files (MP3, FLAC, WAV, and more).
          </li>
          <li>
            <a
              href={GITHUB_API_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              TheMusicTreeAPI
            </a>{" "}
            — the backend that powers this app: genre data, recommendations, and your listening profile.
          </li>
          <li>
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              HearTheMusicTree
            </a>{" "}
            — a cloud audio manager for collectors and DJs: smart playlists, many formats, and sync across devices (in
            development).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-gray-800">GitHub</h2>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-fit px-4 py-2 text-base font-medium text-white bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          <FaGithub className="text-xl" />
          View on GitHub
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
      </section>

      {contactEmail && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-gray-800">Contact</h2>
          <a href={`mailto:${contactEmail}`} className="text-base text-blue-600 hover:text-blue-800 transition-colors">
            {contactEmail}
          </a>
        </section>
      )}
    </div>
  );
}
