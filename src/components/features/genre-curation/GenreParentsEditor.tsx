"use client";

import GenrePicker from "@components/features/curation/GenrePicker";
import { useSecondaryParent, useSecondaryParents } from "@hooks/curation/useSecondaryParent";
import { useUpdateGenreParent } from "@hooks/curation/useUpdateGenreParent";

interface Props {
  genre: { uuid: string; parent: { uuid: string; name: string } | null };
}

export default function GenreParentsEditor({ genre }: Props) {
  const updateParent = useUpdateGenreParent();
  const { data: secondary = [] } = useSecondaryParents(genre.uuid);
  const secondaryParent = useSecondaryParent();

  return (
    <div className="flex flex-col gap-2">
      <GenrePicker
        label="Main parent"
        value={genre.parent?.name ?? ""}
        defaultText={genre.parent?.name ?? ""}
        onChange={(_itemId, name, uuid) => {
          if (uuid && name) updateParent.mutate({ uuid: genre.uuid, parent: { uuid, name }, previous: genre.parent });
        }}
      />
      <ul className="flex flex-wrap items-center gap-2">
        {secondary.map((parent) => (
          <li key={parent.uuid} className="flex items-center gap-1 px-2 py-0.5 text-sm bg-gray-100 rounded-full">
            Also under: {parent.name}
            <button
              type="button"
              aria-label={`Remove secondary parent ${parent.name}`}
              onClick={() => secondaryParent.mutate({ uuid: genre.uuid, parent, add: false })}
              className="cursor-pointer"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <GenrePicker
        key={secondary.length}
        label="+ Add secondary parent"
        value=""
        defaultText=""
        onChange={(_itemId, name, uuid) => {
          if (uuid && name) secondaryParent.mutate({ uuid: genre.uuid, parent: { uuid, name }, add: true });
        }}
      />
    </div>
  );
}
