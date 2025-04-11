export async function fetchWrapper(apiCall, onError) {
  try {
    const response = await apiCall();
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response;
  } catch (error) {
    onError({ response: { status: error.message } });
    throw error;
  }
}
