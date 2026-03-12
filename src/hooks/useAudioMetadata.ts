import { z } from "zod";

import { useValidatedMutation } from "@hooks/useValidatedMutation";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { audioMetadataEndpoints } from "@api/domains/audio-metadata/";
import { AudioMetadataDetailedSchema } from "@schemas/domain/audio-metadata/detailed";

export function useGetFullMetadata() {
  const { fetch } = useFetchWrapper();

  return useValidatedMutation({
    inputSchema: z.instanceof(File),
    outputSchema: AudioMetadataDetailedSchema,
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return fetch(audioMetadataEndpoints.full, true, false, {
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type header to let browser set it with boundary for FormData
        },
      });
    },
  });
}
