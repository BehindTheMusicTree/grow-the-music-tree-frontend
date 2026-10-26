"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import Combobox from "@components/ui/Combobox";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { PATHS } from "@lib/constants/routes";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { ArtistSearchSchema } from "@schemas/api/artistSearch";

const MIN_QUERY_LENGTH = 2;

export default function ArtistSearch() {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const query = useDebouncedValue(text.trim(), 250);
  const enabled = open && query.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError } = useQueryWithParse({
    queryKey: ["artistSearch", query],
    queryFn: () => fetch("artists/search/", true, false, {}, { q: query, limit: 8 }),
    schema: ArtistSearchSchema,
    context: "ArtistSearch",
    enabled,
  });
  const artists = enabled ? (data ?? []) : [];
  const settled = enabled && !isFetching && query === text.trim();

  const pick = (index: number) => {
    setOpen(false);
    router.push(PATHS.ARTIST(artists[index].uuid));
  };

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="relative flex items-center rounded-full bg-black/70 shadow-lg backdrop-blur"
    >
      <Search className="absolute left-3 h-4 w-4 text-gray-400" aria-hidden />
      <Combobox
        ariaLabel="Search artists"
        listLabel="Artists"
        value={text}
        placeholder="Search artists"
        options={artists.map((artist) => ({
          key: artist.uuid,
          content: (
            <>
              <span className="block truncate font-medium">
                {artist.name}
                {artist.disambiguation && <span className="font-normal text-gray-500"> · {artist.disambiguation}</span>}
              </span>
              {artist.matchedAlias && (
                <span className="block truncate text-xs text-gray-500">also known as {artist.matchedAlias}</span>
              )}
            </>
          ),
        }))}
        open={open}
        onValueChange={setText}
        onOpenChange={setOpen}
        onPick={pick}
        inputClassName="w-36 rounded-full bg-transparent py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-400 focus:w-56 focus:outline-none transition-[width] sm:w-48"
        optionClassName="px-3 py-2 text-sm text-gray-900 cursor-pointer aria-selected:bg-gray-100 hover:bg-gray-100"
      />
      <p role="status" aria-live="polite" className="sr-only">
        {isError
          ? "Search failed"
          : settled && artists.length === 0
            ? "No artists found"
            : artists.length > 0
              ? `${artists.length} artists found`
              : ""}
      </p>
    </form>
  );
}
