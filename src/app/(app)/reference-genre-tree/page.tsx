"use client";

import { useCallback, useEffect, useRef } from "react";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import { useCreateGenre, GenreTreeView, CriteriaMinimum } from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import Page from "@components/ui/Page";
import { getBackendBaseUrl } from "@lib/site-urls";

export default function ReferenceGenreTreePage() {
  const { mutate: createGenre, formErrors } = useCreateGenre("reference", getBackendBaseUrl);
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

  const uploadTimeoutMs = Number(process.env.NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS);
  if (!Number.isFinite(uploadTimeoutMs) || uploadTimeoutMs <= 0) {
    throw new Error("NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS must be a positive number");
  }

  return (
    <Page title="Reference Genre Tree" visuallyHiddenTitle dataPage="reference-genre-tree">
      <GenreTreeView
        scope="reference"
        handleGenreCreationAction={showCriteriaCreationPopup}
        getBackendBaseUrl={getBackendBaseUrl}
        uploadTimeoutMs={uploadTimeoutMs}
      />
    </Page>
  );
}
