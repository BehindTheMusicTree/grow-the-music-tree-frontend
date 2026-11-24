"use client";

import { useId, useState } from "react";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { useGenreRemoteSearch, type GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import { Combobox } from "@behindthemusictree/ui";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { AliasTargetSearchSchema, CurationItemSearchSchema, ITEM_ID_PATTERN } from "@schemas/api/curation";

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
  aliasTargets?: boolean;
};

const GENRE_LIMIT = 25;
const TREE_LABELS: Record<string, string> = { canonical: "Canonique", regional: "Régional", local: "Local" };

type Option = { key: string; name: string; itemId: string; uuid?: GenreUuid; tree?: string };

/** Finds a canonical genre by name, or takes a QID / LOCAL:<slug> typed as is. */
export default function GenrePicker({
  label,
  value,
  defaultText,
  onChange,
  excludeUmbrellas = false,
  catalog = false,
  aliasTargets = false,
}: Props) {
  const id = useId();
  const [text, setText] = useState(defaultText);
  const [open, setOpen] = useState(false);
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const search = useDebouncedValue(text.trim(), 250);
  const isItemId = ITEM_ID_PATTERN.test(search);
  const enabled = open && search.length >= 2 && (!isItemId || aliasTargets);
  const genres = useGenreRemoteSearch(getGrowBackendBaseUrl, enabled && !catalog && !aliasTargets ? text.trim() : "", {
    treeName: "canonical",
    limit: GENRE_LIMIT,
  });
  const items = useQueryWithParse({
    queryKey: ["curationItemPicker", search],
    queryFn: () => fetch("curation/items/", true, false, {}, { q: search }),
    schema: CurationItemSearchSchema,
    context: "GenrePicker",
    enabled: enabled && catalog && !aliasTargets,
  });
  const aliasItems = useQueryWithParse({
    queryKey: ["genreAliasTargetPicker", search],
    queryFn: () => fetch("curation/genre-alias-targets/", true, false, {}, { q: search }),
    schema: AliasTargetSearchSchema,
    context: "GenrePicker",
    enabled: enabled && aliasTargets,
  });
  const isFetching = genres.pending || items.isFetching || aliasItems.isFetching;
  const options: Option[] = aliasTargets
    ? (search === text.trim() ? aliasItems.data?.results ?? [] : []).map(({ id, label, tree }) => ({
        key: id,
        name: label,
        itemId: id,
        tree,
      }))
    : catalog
    ? (items.data?.results ?? []).map((item) => ({ key: item.id, name: item.label, itemId: item.id }))
    : genres.genres.flatMap((genre) =>
        genre.wikidataId === null || (excludeUmbrellas && genre.isUmbrella)
          ? []
          : [{ key: genre.uuid, name: genre.name, itemId: genre.wikidataId, uuid: genre.uuid }],
      );

  const pick = (_groupKey: string, optionKey: string) => {
    const option = options.find((candidate) => candidate.key === optionKey);
    if (!option) return;
    setText(option.name);
    setOpen(false);
    onChange(option.itemId, option.name, option.uuid);
  };

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={`${id}-input`} className="text-body font-medium text-gray-700">
        {label}
      </label>
      <Combobox
        inputId={`${id}-input`}
        describedBy={`${id}-qid`}
        listLabel={label}
        value={text}
        placeholder="Nom du genre, Q123 ou LOCAL:slug"
        groups={[
          {
            key: "genres",
            options: options.map((option) => ({
              key: option.key,
              content: (
                <div className="flex justify-between gap-2">
                  <span>{option.name}</span>
                  <span className="font-mono text-caption text-gray-500">{option.tree && `${TREE_LABELS[option.tree]} · `}{option.itemId}</span>
                </div>
              ),
            })),
          },
        ]}
        open={open}
        onValueChange={(next) => {
          setText(next);
          if (aliasTargets) {
            if (value && next !== text) onChange("");
          } else if (ITEM_ID_PATTERN.test(next.trim())) {
            onChange(next.trim());
          }
        }}
        onOpenChange={setOpen}
        onPick={pick}
      />
      <p id={`${id}-qid`} className="font-mono text-caption text-gray-500">
        {value ? `${aliasTargets ? "ID" : "QID"} : ${value}` : "Aucun genre choisi"}
        {isFetching && " · recherche…"}
        {aliasTargets && aliasItems.isError && " · catalogue indisponible"}
      </p>
    </div>
  );
}
