"use client";

import { useState } from "react";
import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import Page from "@components/ui/Page";
import { usePopup } from "@contexts/PopupContext";
import useGetFullMetadata from "@hooks/useAudioMetadata";

export default function MetadataManagerPage() {
  const [metadata, setMetadata] = useState<JSON | null>();
  const metadataMutation = useGetFullMetadata();
  const { showPopup, hidePopup, activePopup } = usePopup();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files?.[0] ?? null;

    if (file) {
      showPopup(
        <TrackUploadPopup
          files={[file]}
          onProcessFile={(file, _genre) => metadataMutation.mutateAsync(file)}
          onComplete={() => {}}
          onClose={() => {
            hidePopup();
          }}
        />,
      );
      const response = await metadataMutation.mutateAsync(file);
      setMetadata(response);
    }
  }

  return (
    <Page title="Metadata Manager">
      <input type="file" onChange={handleChange} />
      <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4">
        {metadata != null ? (
          <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-gray-800">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No metadata</p>
        )}
      </div>
    </Page>
  );
}
