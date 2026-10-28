import type { ReactNode } from "react";
import { FieldList } from "@behindthemusictree/ui";
import type { ArtistDetailed } from "@schemas/api/artist";
import ArtistLinks, { artistLinks } from "./ArtistLinks";
import { formatYears } from "./formatYears";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export default function ArtistHeader({ artist }: { artist: ArtistDetailed }) {
  const fields: { label: string; value: ReactNode }[] = [];
  if (artist.type) fields.push({ label: "Type", value: artist.type.charAt(0).toUpperCase() + artist.type.slice(1) });
  const country = artist.country && countryNames.of(artist.country);
  if (country) fields.push({ label: "Country", value: country });
  const years = formatYears(artist.beginYear, artist.endYear, artist.ended);
  if (years) fields.push({ label: "Active", value: years });
  const links = artistLinks(artist);
  if (links.length > 0) fields.push({ label: "Links", value: <ArtistLinks links={links} /> });

  if (fields.length === 0) return null;
  return <FieldList items={fields} />;
}
