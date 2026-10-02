"use client";

import { useId, useState } from "react";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CanonicalGenreSearchSchema, ITEM_ID_PATTERN } from "@schemas/api/curation";

type Props = {
  label: string;
  value: string;
  /** What the input shows first, e.g. the genre's name rather than its QID. */
  defaultText: string;
  onChange: (itemId: string, name?: string) => void;
};

/** Finds a canonical genre by name, or takes a QID / LOCAL:<slug> typed as is. */
export default function GenrePicker({ label, value, defaultText, onChange }: Props) {
  const id = useId();
  const [text, setText] = useState(defaultText);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const search = useDebouncedValue(text.trim(), 250);
  const isItemId = ITEM_ID_PATTERN.test(search);
  const { data, isFetching } = useQueryWithParse({
    queryKey: ["curationGenrePicker", search],
    queryFn: () => fetch("genres/", true, false, {}, { name: search, pageSize: 10 }),
    schema: CanonicalGenreSearchSchema,
    context: "GenrePicker",
    enabled: open && search.length >= 2 && !isItemId,
  });
  const options = (data?.results ?? []).filter(
    (genre): genre is typeof genre & { wikidataId: string } => genre.wikidataId !== null,
  );
  const expanded = open && options.length > 0;

  const pick = (genre: { name: string; wikidataId: string }) => {
    setText(genre.name);
    setOpen(false);
    onChange(genre.wikidataId, genre.name);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (!expanded) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
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
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          className="absolute top-full z-10 w-full max-h-60 overflow-y-auto bg-white border rounded-md shadow-lg"
        >
          {options.map((genre, index) => (
            <li
              key={genre.uuid}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                pick(genre);
              }}
              className="flex justify-between gap-2 px-3 py-2 cursor-pointer aria-selected:bg-gray-100 hover:bg-gray-100"
            >
              <span>{genre.name}</span>
              <span className="font-mono text-xs text-gray-500">{genre.wikidataId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
