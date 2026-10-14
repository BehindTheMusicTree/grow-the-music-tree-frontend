import type { ArtistDetailed } from "@schemas/api/artist";
import { formatYears } from "./formatYears";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export default function ArtistHeader({ artist }: { artist: ArtistDetailed }) {
  const years = formatYears(artist.beginYear, artist.endYear, artist.ended);
  const facts = [
    artist.type && artist.type.charAt(0).toUpperCase() + artist.type.slice(1),
    artist.country && countryNames.of(artist.country),
    years,
  ].filter(Boolean);

  if (facts.length === 0) return null;
  return <p className="text-gray-600">{facts.join(" · ")}</p>;
}
