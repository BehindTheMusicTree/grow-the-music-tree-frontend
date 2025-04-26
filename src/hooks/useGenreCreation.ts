"use client";

import { useState } from "react";
import { useCreateGenre } from "./useGenre";
import { GenreCreationValues } from "@schemas/genre/form";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";

export function useGenreCreation() {
  const [show, setShow] = useState(false);
  const [parentUuid, setParentUuid] = useState<string | undefined>();
  const { mutate: createGenre } = useCreateGenre();

  const [formValues, setFormValues] = useState<GenreCreationValues>({
    name: "",
    parentUuid: undefined,
  });

  const showCreationPopup = (parentUuid?: string) => {
    setParentUuid(parentUuid);
    setFormValues({
      name: "",
      parentUuid,
    });
    setShow(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGenre(formValues);
    setShow(false);
  };

  const GenreCreationComponent = () => {
    if (!show) return null;

    return (
      <GenreCreationPopup
        formValues={formValues}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setShow(false)}
      />
    );
  };

  return {
    showCreationPopup,
    GenreCreationComponent,
  };
}
