export const makeUploadedEndpoints = (root: string) => ({
  list: () => `${root}/library/uploaded/`,
  detail: (uuid: string) => `${root}/library/uploaded/${uuid}/`,
  create: () => `${root}/library/uploaded/`,
  update: (uuid: string) => `${root}/library/uploaded/${uuid}/`,
  delete: (uuid: string) => `${root}/library/uploaded/${uuid}/`,
  download: (uuid: string) => `${root}/library/uploaded/${uuid}/download/`,
});
