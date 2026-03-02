"use client";

import Page from "@components/ui/Page";
import useGetFullMetadata from "@hooks/useAudioMetadata";
import { useState } from "react";

export default function MetadataManagerPage() {
  const [metadata, setMetadata] = useState<JSON | null>();
  const metadataMutation = useGetFullMetadata();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files?.[0] ?? null;

    if (file) {
      const response = await metadataMutation.mutateAsync(file);
      setMetadata(response);
    }
  }

  return (
    <Page title="Metadata Manager">
      <input type="file" onChange={handleChange} />
      <div className="mt-4 max-h-[70vh] overflow-auto p-4 rounded-lg border border-gray-200 bg-gray-50">
        {metadata != null ? (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-gray-800">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No metadata</p>
        )}
      </div>
    </Page>
  );
}
