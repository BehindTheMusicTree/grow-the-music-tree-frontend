export const makeUploadedQueryKeys = (prefix: string) => ({
  all: [`${prefix}UploadedTracks`] as const,
  list: (page: number) => [`${prefix}UploadedTracks`, "list", page] as const,
  detail: (uuid: string) => [`${prefix}UploadedTracks`, "detail", uuid] as const,
  download: (uuid: string) => [`${prefix}UploadedTracks`, "download", uuid] as const,
});
