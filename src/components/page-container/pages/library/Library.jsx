import { useLibTracks } from "../../../../contexts/lib-tracks/useLibTracks";
import { formatTime } from "../../../../utils";
import { FaRegClock } from "react-icons/fa";

export default function Library() {
  const { libTracks } = useLibTracks();

  return (
    <div className="flex flex-col">
      <h1>Library</h1>
      <table className="table-auto w-full border-gray-500">
        <thead>
          <tr>
            <th className="library-item">#</th>
            <th className="library-item">Title</th>
            <th className="library-item">Artist</th>
            <th className="library-item">Album</th>
            <th className="library-item">Genre</th>
            <th className="library-item">Rating</th>
            <th className="library-item">
              <div className="flex justify-center items-center">
                <FaRegClock />
              </div>
            </th>
            <th className="library-item">Format</th>
            <th className="library-item">Bitrate</th>
            <th className="library-item">Plays</th>
          </tr>
        </thead>
        <tbody className="space-y-10">
          {libTracks?.map((track, index) => (
            <tr key={track.id} className="hover:bg-gray-300">
              <td className="library-item pl-2">{index + 1}</td>
              <td className="library-item">{track.title}</td>
              <td className="library-item">{track.artist ? track.artist.name : ""}</td>
              <td className="library-item">{track.album ? track.album.name : ""}</td>
              <td className="library-item">{track.genre ? track.genre.name : ""}</td>
              <td className="library-item text-center">{track.rating}</td>
              <td className="library-item">{formatTime(track.duration)}</td>
              <td className="library-item text-center">{track.file.extension.replace(".", "")}</td>
              <td className="library-item text-center">{track.file.bitrateInKbps} kbps</td>
              <td className="library-item text-center">{track.playCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
