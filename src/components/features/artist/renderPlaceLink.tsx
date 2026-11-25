import Link from "next/link";
import type { RenderPlaceLink } from "@behindthemusictree/app-kit/genre-tree";
import { mapRegionHref } from "@lib/searchHrefs";

/** The artist's origin opens its region on the map; app-kit only calls this when the origin has a `regionId`. */
export const renderPlaceLink: RenderPlaceLink = (origin) => (
  <Link href={mapRegionHref(origin.regionId)} className="hover:underline">
    {origin.name}
  </Link>
);
