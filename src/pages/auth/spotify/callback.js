import SpotifyCallback from "@/app/spotify-callback/page";

export default function SpotifyCallbackPage() {
  return (
    <div className="page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0">
      <SpotifyCallback />
    </div>
  );
}
