import { useMutation } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { audioMetadataEndpoints } from "@api/domains/audio-metadata/";

export function useGetFullMetadata() {
  const { fetch } = useFetchWrapper();

  return useMutation<JSON | null, Error, File>({
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
