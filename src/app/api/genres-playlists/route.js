export async function GET(request) {
  const token = request.cookies.get("auth_token")?.value;

  const response = await fetch(`${process.env.API_BASE_URL}genre-playlists/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}
