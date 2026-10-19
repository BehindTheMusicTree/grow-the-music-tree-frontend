"use client";

import { useState } from "react";
import { useUpdateGenre } from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export default function GenreNameEditor({ genre }: { genre: { uuid: string; name: string } }) {
  const [name, setName] = useState(genre.name);
  const { mutate, formErrors } = useUpdateGenre("reference", getGrowBackendBaseUrl);

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        aria-label="Genre name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") mutate({ uuid: genre.uuid, data: { name } });
          if (event.key === "Escape") {
            event.stopPropagation();
            setName(genre.name);
          }
        }}
        className="w-full px-2 py-1 text-lg font-semibold border rounded-md"
      />
      {formErrors.map((error, index) => (
        <p key={index} role="alert" className="text-sm text-red-600">
          {error.message}
        </p>
      ))}
    </div>
  );
}
