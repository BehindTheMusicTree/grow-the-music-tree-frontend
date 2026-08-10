"use client";

import { useCallback, useEffect, useRef } from "react";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useCreateGenre,
  useListFullGenrePlaylists,
  GenreTreeView,
  CriteriaMinimum,
} from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import Page from "@components/ui/Page";
import { getBackendBaseUrl } from "@lib/site-urls";

// TEMP DIAGNOSTIC: staging vs prod skeleton investigation (remove before merging).
// Surfaces the same query state GenreTreeView consumes internally, since that
// component's loading state isn't otherwise observable from this page.
function GenreTreeQueryDiagnostics() {
  const backendBaseUrl = getBackendBaseUrl();
  const { data, status, fetchStatus, isPending, isError, error, dataUpdatedAt, errorUpdatedAt } =
    useListFullGenrePlaylists("reference", getBackendBaseUrl);

  useEffect(() => {
    console.log("[diag:genre-tree]", {
      backendBaseUrl,
      status,
      fetchStatus,
      isPending,
      isError,
      error: error instanceof Error ? error.message : error,
      resultsCount: data?.results?.length,
      dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null,
      errorUpdatedAt: errorUpdatedAt ? new Date(errorUpdatedAt).toISOString() : null,
    });
  }, [backendBaseUrl, status, fetchStatus, isPending, isError, error, data, dataUpdatedAt, errorUpdatedAt]);

  return (
    <div
      data-diag="genre-tree-query"
      className="fixed bottom-2 right-2 z-50 max-w-sm rounded-md bg-black/80 p-3 text-xs text-white font-mono"
    >
      <div>backend: {backendBaseUrl}</div>
      <div>
        status: {status} / fetchStatus: {fetchStatus}
      </div>
      <div>results: {data?.results?.length ?? "n/a"}</div>
      {isError && <div className="text-red-400">error: {error instanceof Error ? error.message : String(error)}</div>}
      <div>dataUpdatedAt: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "-"}</div>
    </div>
  );
}

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
      {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && <GenreTreeQueryDiagnostics />}
    </Page>
  );
}
