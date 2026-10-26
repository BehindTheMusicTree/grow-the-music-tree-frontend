import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Page from "@components/ui/Page";
import ArtistHeader from "@components/features/artist/ArtistHeader";
import ArtistLinks from "@components/features/artist/ArtistLinks";
import ArtistMembers from "@components/features/artist/ArtistMembers";
import ArtistDiscography from "@components/features/artist/ArtistDiscography";
import ArtistSongs from "@components/features/artist/ArtistSongs";
import { fetchArtist } from "@lib/artist";

type ArtistPageProps = { params: Promise<{ uuid: string }> };

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const artist = await fetchArtist((await params).uuid);
  return { title: artist?.name ?? "Artist not found" };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const artist = await fetchArtist((await params).uuid);
  if (!artist) notFound();

  return (
    <Page title={artist.name} dataPage="artist">
      <div className="flex max-w-4xl flex-col gap-8 px-4 pb-8">
        <ArtistHeader artist={artist} />
        <ArtistLinks artist={artist} />
        <ArtistMembers title="Members" memberships={artist.members} />
        <ArtistMembers title="Member of" memberships={artist.memberOf} />
        <ArtistDiscography albums={artist.albums} />
        {artist.tracksCount > 0 && <ArtistSongs artist={{ uuid: artist.uuid, name: artist.name }} />}
      </div>
    </Page>
  );
}
