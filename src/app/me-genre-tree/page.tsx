"use client";

import { useCallback, useEffect, useRef } from "react";

import { usePopup } from "@contexts/PopupContext";
import { useCreateGenre } from "@hooks/useGenre";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

import { GenreTreeView } from "./GenreTreeView";

export default function GenreTree() {
  const { mutate: createGenre, formErrors } = useCreateGenre("me");
  const { showPopup, hidePopup } = usePopup();

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) => {
      showPopup(
        <GenreCreationPopup
          parent={parent}
          onSubmit={({ name, parent }: { name: string; parent?: string }) => {
            createGenre({ name, parent });
            hidePopup();
          }}
          onClose={hidePopup}
          formErrors={formErrors}
        />,
      );
    },
    [formErrors, createGenre, hidePopup, showPopup],
  );

  const previousErrorsRef = useRef<typeof formErrors>([]);

  useEffect(() => {
    if (
      formErrors &&
      formErrors.length > 0 &&
      (previousErrorsRef.current.length === 0 ||
        JSON.stringify(previousErrorsRef.current) !== JSON.stringify(formErrors))
    ) {
      showCriteriaCreationPopup();
    }
    previousErrorsRef.current = formErrors || [];
  }, [formErrors, showCriteriaCreationPopup]);

  return <GenreTreeView scope="me" handleGenreCreationAction={showCriteriaCreationPopup} />;
}
