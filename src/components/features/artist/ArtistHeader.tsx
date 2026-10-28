import { FieldList } from "@behindthemusictree/ui";
import type { ArtistDetailed } from "@schemas/api/artist";
import { formatYears } from "./formatYears";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export default function ArtistHeader({ artist }: { artist: ArtistDetailed }) {
  const fields = [
    { label: "Type", value: artist.type && artist.type.charAt(0).toUpperCase() + artist.type.slice(1) },
    { label: "Country", value: artist.country && countryNames.of(artist.country) },
    { label: "Active", value: formatYears(artist.beginYear, artist.endYear, artist.ended) },
  ].filter((field): field is { label: string; value: string } => Boolean(field.value));

  if (fields.length === 0) return null;
  return <FieldList items={fields} />;
}
