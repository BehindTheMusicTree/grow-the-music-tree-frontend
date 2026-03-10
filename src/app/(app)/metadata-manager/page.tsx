"use client";

import { useRef, useState } from "react";
import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import Page from "@components/ui/Page";
import { usePopup } from "@contexts/PopupContext";
import { useGetFullMetadata } from "@hooks/useAudioMetadata";
import { AudioMetadataDetailed } from "@schemas/domain/audio-metadata/detailed";

export default function MetadataManagerPage() {
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadataDetailed>();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metadataMutation = useGetFullMetadata();
  const { showPopup, hidePopup } = usePopup();

  const noMetadataPlaceholder = "No metadata";
  const sectionBoxClass = "min-h-[200px] min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-6";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files?.[0] ?? null;

    async function onProcessFile(file: File, _genre: any) {
      const audiometadata = await metadataMutation.mutateAsync(file);
      setAudioMetadata(audiometadata);
    }

    if (file) {
      setSelectedFileName(file.name);
      showPopup(
        <TrackUploadPopup
          files={[file]}
          onProcessFile={onProcessFile}
          onComplete={() => {}}
          onClose={() => {
            hidePopup();
          }}
        />,
      );
    }
  }

  return (
    <Page title="Metadata Manager" dataPage="metadata-manager">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleChange}
            className="sr-only"
            aria-label="Choose an audio file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose file
          </button>
          <span
            className="min-w-0 flex-1 truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
            aria-live="polite"
          >
            {selectedFileName ?? "No file chosen"}
          </span>
        </div>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          <section className={sectionBoxClass}>
            <header>
              <h2>Technical Information</h2>
            </header>
            {audioMetadata ? <pre>{JSON.stringify(audioMetadata.technicalInfo, null, 2)}</pre> : noMetadataPlaceholder}
          </section>
          <section className={sectionBoxClass}>
            <header>
              <h2>Format priorities</h2>
            </header>
            <pre>{audioMetadata ? JSON.stringify(audioMetadata.formatPriorities, null, 2) : noMetadataPlaceholder}</pre>
          </section>
          <section className={sectionBoxClass}>
            <header>
              <h2>Unified Metadata</h2>
            </header>
            {audioMetadata ? (
              <pre>{JSON.stringify(audioMetadata.unifiedMetadata, null, 2)}</pre>
            ) : (
              noMetadataPlaceholder
            )}
          </section>
          <section className={sectionBoxClass}>
            <header>
              <h2>Formats Headers</h2>
            </header>
            {audioMetadata ? <pre>{JSON.stringify(audioMetadata.headers, null, 2)}</pre> : noMetadataPlaceholder}
          </section>
          <section className={sectionBoxClass}>
            <header>
              <h2>Metadata Raw</h2>
            </header>
            {audioMetadata ? <pre>{JSON.stringify(audioMetadata.rawMetadata, null, 2)}</pre> : noMetadataPlaceholder}
          </section>
        </div>
      </div>
    </Page>
  );
}
