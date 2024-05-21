import { useLibTracks } from "../../../../contexts/lib-tracks/useLibTracks";
import { formatTime } from "../../../../utils";
import { FaRegClock } from "react-icons/fa";
import Rating from "../../../utils/Rating";
import LibTrackPositionPlayPause from "../../../utils/LibTrackPositionPlayPause";
import { usePlayerTrackObject } from "../../../../contexts/player-lib-track-object/usePlayerLibTrackObject";
import { useTrackList } from "../../../../contexts/track-list/useTrackList";

export default function Library() {
  const { libTracks } = useLibTracks();
  const { playerLibTrackObject, handlePlayPauseAction } = usePlayerTrackObject();
  const { setNewTrackListFromLibTrackUuid } = useTrackList();

  const handlePlayPauseClick = (libTrackUuid) => {
    if (playerLibTrackObject && playerLibTrackObject.libraryTrack.uuid == libTrackUuid) {
      handlePlayPauseAction();
    } else {
      setNewTrackListFromLibTrackUuid(libTrackUuid);
    }
  };

  return (
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
        {libTracks?.map((libTrack, index) => (
          <tr key={libTrack.id} className="hover:bg-gray-300 group">
            <td className="library-item w-4 text-center pl-4 pr-1">
              <LibTrackPositionPlayPause
                position={index + 1}
                uuid={libTrack.uuid}
                handlePlayPauseClick={() => handlePlayPauseClick(libTrack.uuid)}
              />
            </td>
            <td className="library-item max-w-64">{libTrack.title}</td>
            <td className="library-item">{libTrack.artist ? libTrack.artist.name : ""}</td>
            <td className="library-item">{libTrack.album ? libTrack.album.name : ""}</td>
            <td className="library-item">{libTrack.genre ? libTrack.genre.name : ""}</td>
            <td className="library-item text-center">
              <Rating
                rating={libTrack.rating}
                handleChange={() => {
                  return;
                }}
              />
            </td>
            <td className="library-item">{formatTime(libTrack.duration)}</td>
            <td className="library-item text-center">{libTrack.file.extension.replace(".", "")}</td>
            <td className="library-item text-center">{libTrack.file.bitrateInKbps} kbps</td>
            <td className="library-item text-center">{libTrack.playCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
