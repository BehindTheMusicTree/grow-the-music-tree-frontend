"use client";

import { useId, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CanonicalGenreSearchSchema, CurationItemSearchSchema, ITEM_ID_PATTERN } from "@schemas/api/curation";

type Props = {
  label: string;
  value: string;
  /** What the input shows first, e.g. the genre's name rather than its QID. */
  defaultText: string;
  onChange: (itemId: string, name?: string, uuid?: string) => void;
  /** Umbrella genres cannot hold recordings directly, so assignment targets leave them out. */
  excludeUmbrellas?: boolean;
  /** Searches every known Wikidata item, pruned ones included, instead of the canonical genres. */
  catalog?: boolean;
};

type Option = { key: string; name: string; itemId: string; uuid?: string };

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
  const [active, setActive] = useState(0);
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
  const expanded = open && options.length > 0;
  const canLoadMore = !catalog && genres.hasNextPage && !genres.isFetchingNextPage;
  const loadMore = () => {
    if (canLoadMore) void genres.fetchNextPage();
  };

  const pick = (option: Option) => {
    setText(option.name);
    setOpen(false);
    onChange(option.itemId, option.name, option.uuid);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (!expanded) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (step === 1 && active === options.length - 1 && canLoadMore) {
        loadMore();
        return;
      }
      setActive((active + step + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(options[active]);
    }
  };

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={`${id}-input`} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={`${id}-input`}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-qid`}
        value={text}
        placeholder="Nom du genre, Q123 ou LOCAL:slug"
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          setOpen(true);
          setActive(0);
          if (ITEM_ID_PATTERN.test(next.trim())) onChange(next.trim());
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border rounded-md"
      />
      <p id={`${id}-qid`} className="font-mono text-xs text-gray-500">
        {value ? `QID : ${value}` : "Aucun genre choisi"}
        {isFetching && " · recherche…"}
      </p>
      {expanded && (
        <div className="absolute top-full z-10 w-full bg-white border rounded-md shadow-lg">
          <ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label={label}
            onScroll={(event) => {
              const list = event.currentTarget;
              if (list.scrollHeight - list.scrollTop - list.clientHeight < 24) loadMore();
            }}
            className="max-h-60 overflow-y-auto"
          >
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(option);
                }}
                className="flex justify-between gap-2 px-3 py-2 cursor-pointer aria-selected:bg-gray-100 hover:bg-gray-100"
              >
                <span>{option.name}</span>
                <span className="font-mono text-xs text-gray-500">{option.itemId}</span>
              </li>
            ))}
          </ul>
          {!catalog && genres.hasNextPage && (
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
          )}
        </div>
      )}
    </div>
  );
}
