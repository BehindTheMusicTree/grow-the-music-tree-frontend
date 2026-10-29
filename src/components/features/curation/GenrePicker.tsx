"use client";

import { useId, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import type { GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import Combobox from "@components/ui/Combobox";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CanonicalGenreSearchSchema, CurationItemSearchSchema, ITEM_ID_PATTERN } from "@schemas/api/curation";

type Props = {
  label: string;
  value: string;
  /** What the input shows first, e.g. the genre's name rather than its QID. */
  defaultText: string;
  onChange: (itemId: string, name?: string, uuid?: GenreUuid) => void;
  /** Umbrella genres cannot hold songs directly, so assignment targets leave them out. */
  excludeUmbrellas?: boolean;
  /** Searches every known Wikidata item, pruned ones included, instead of the canonical genres. */
  catalog?: boolean;
};

type Option = { key: string; name: string; itemId: string; uuid?: GenreUuid };

/** Finds a canonical genre by name, or takes a QID / LOCAL:<slug> typed as is. */
export default function GenrePicker({
  label,
  value,
  defaultText,
  onChange,
  excludeUmbrellas = false,
  catalog = false,
}: Props) {
  const id = useId();
  const [text, setText] = useState(defaultText);
  const [open, setOpen] = useState(false);
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const search = useDebouncedValue(text.trim(), 250);
  const isItemId = ITEM_ID_PATTERN.test(search);
  const enabled = open && search.length >= 2 && !isItemId;
  const genres = useInfiniteQuery({
    queryKey: ["curationGenrePicker", search],
    enabled: enabled && !catalog,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      CanonicalGenreSearchSchema.parse(await fetch("genres/", true, false, {}, { name: search, pageSize: 10, page: pageParam })),
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const items = useQueryWithParse({
    queryKey: ["curationItemPicker", search],
    queryFn: () => fetch("curation/items/", true, false, {}, { q: search }),
    schema: CurationItemSearchSchema,
    context: "GenrePicker",
    enabled: enabled && catalog,
  });
  const isFetching = genres.isFetching || items.isFetching;
  const options: Option[] = catalog
    ? (items.data?.results ?? []).map((item) => ({ key: item.id, name: item.label, itemId: item.id }))
    : (genres.data?.pages.flatMap((page) => page.results) ?? []).flatMap((genre) =>
        genre.wikidataId === null || (excludeUmbrellas && genre.isUmbrella)
          ? []
          : [{ key: genre.uuid, name: genre.name, itemId: genre.wikidataId, uuid: genre.uuid }],
      );
  const canLoadMore = !catalog && genres.hasNextPage && !genres.isFetchingNextPage;
  const loadMore = () => {
    if (canLoadMore) void genres.fetchNextPage();
  };

  const pick = (index: number) => {
    const option = options[index];
    setText(option.name);
    setOpen(false);
    onChange(option.itemId, option.name, option.uuid);
  };

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={`${id}-input`} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <Combobox
        inputId={`${id}-input`}
        describedBy={`${id}-qid`}
        listLabel={label}
        value={text}
        placeholder="Nom du genre, Q123 ou LOCAL:slug"
        options={options.map((option) => ({
          key: option.key,
          content: (
            <>
              <span>{option.name}</span>
              <span className="font-mono text-xs text-gray-500">{option.itemId}</span>
            </>
          ),
        }))}
        open={open}
        onValueChange={(next) => {
          setText(next);
          if (ITEM_ID_PATTERN.test(next.trim())) onChange(next.trim());
        }}
        onOpenChange={setOpen}
        onPick={pick}
        onLoadMore={loadMore}
        canLoadMore={canLoadMore}
        inputClassName="w-full px-3 py-2 border rounded-md"
        optionClassName="flex justify-between gap-2 px-3 py-2 cursor-pointer aria-selected:bg-gray-100 hover:bg-gray-100"
        footer={
          !catalog && genres.hasNextPage ? (
            <button
              type="button"
              disabled={genres.isFetchingNextPage}
              onMouseDown={(event) => {
                event.preventDefault();
                loadMore();
              }}
              className="w-full px-3 py-2 text-sm text-left text-gray-600 border-t cursor-pointer hover:bg-gray-100 disabled:opacity-50"
            >
              {genres.isFetchingNextPage ? "Chargement…" : "Plus de résultats…"}
            </button>
          ) : null
        }
      />
      <p id={`${id}-qid`} className="font-mono text-xs text-gray-500">
        {value ? `QID : ${value}` : "Aucun genre choisi"}
        {isFetching && " · recherche…"}
      </p>
    </div>
  );
}
