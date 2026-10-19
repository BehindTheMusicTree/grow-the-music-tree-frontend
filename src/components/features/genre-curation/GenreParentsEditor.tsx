"use client";

import { useUpdateGenre } from "@behindthemusictree/app-kit/genre-tree";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useSecondaryParent, useSecondaryParents } from "@hooks/curation/useSecondaryParent";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

interface Props {
  genre: { uuid: string; parentName: string | null };
}

export default function GenreParentsEditor({ genre }: Props) {
  const { mutate: update, formErrors } = useUpdateGenre("reference", getGrowBackendBaseUrl);
  const { data: secondary = [] } = useSecondaryParents(genre.uuid);
  const secondaryParent = useSecondaryParent();

  return (
    <div className="flex flex-col gap-2">
      <GenrePicker
        label="Main parent"
        value={genre.parentName ?? ""}
        defaultText={genre.parentName ?? ""}
        onChange={(_itemId, _name, uuid) => {
          if (uuid) update({ uuid: genre.uuid, data: { parent: uuid } });
        }}
      />
      {formErrors.map((error, index) => (
        <p key={index} role="alert" className="text-sm text-red-600">
          {error.message}
        </p>
      ))}
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
