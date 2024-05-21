import { useLibTracks } from "../../../../contexts/lib-tracks/useLibTracks";

export default function Library() {
  const { libTracks } = useLibTracks();

  return (
    <div className="flex flex-col">
      <h1>Library</h1>
      <table className="table-auto w-full border-gray-500">
        <thead>
          <tr>
            <th className="border-b border-gray-500">Title</th>
            <th className="border-b border-gray-500">Artist</th>
            <th className="border-b border-gray-500">Album</th>
            <th className="border-b border-gray-500">Genre</th>
          </tr>
        </thead>
        <tbody className="space-y-10">
          {libTracks?.map((track) => (
            <tr key={track.id}>
              <td className="border-b border-gray-500 py-2">{track.title}</td>
              <td className="border-b border-gray-500">{track.artist ? track.artist.name : ""}</td>
              <td className="border-b border-gray-500">{track.album ? track.album.name : ""}</td>
              <td className="border-b border-gray-500">{track.genre ? track.genre.name : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
