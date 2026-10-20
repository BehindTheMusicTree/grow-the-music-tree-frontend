"use client";

import { useState } from "react";
import { useUpdateGenreName } from "@hooks/curation/useUpdateGenreName";

export default function GenreNameEditor({ genre }: { genre: { uuid: string; name: string } }) {
  const [name, setName] = useState(genre.name);
  const { mutate } = useUpdateGenreName();

  return (
    <input
      type="text"
      aria-label="Genre name"
      value={name}
      onChange={(event) => setName(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && name !== genre.name) mutate({ uuid: genre.uuid, name, previous: genre.name });
        if (event.key === "Escape") {
          event.stopPropagation();
          setName(genre.name);
        }
      }}
      className="w-full px-2 py-1 text-lg font-semibold border rounded-md"
    />
  );
}
