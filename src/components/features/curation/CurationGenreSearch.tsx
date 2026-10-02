"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@behindthemusictree/ui";
import GenrePicker from "@components/features/curation/GenrePicker";
import { curationGenreHref } from "@components/features/curation/GenreRef";

export default function CurationGenreSearch() {
  const router = useRouter();
  const [itemId, setItemId] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (itemId) router.push(curationGenreHref(itemId));
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-48">
        <GenrePicker label="Règles d'un genre" value={itemId} defaultText="" onChange={setItemId} />
      </div>
      <Button type="submit" disabled={!itemId}>
        Voir les règles
      </Button>
    </form>
  );
}
