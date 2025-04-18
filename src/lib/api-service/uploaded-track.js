import { useAuthenticatedFetch } from "@hooks/useAuthenticatedFetch";

// Pure API service implementations
async function listUploadedTracksImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`uploaded-tracks/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

async function uploadTrackImpl(authFetch, trackData) {
  const response = await authFetch("uploaded-tracks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

async function updateUploadedTrackImpl(authFetch, trackId, trackData) {
  const response = await authFetch(`uploaded-tracks/${trackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

// Export the pure implementations
export { listUploadedTracksImpl, uploadTrackImpl, updateUploadedTrackImpl };
