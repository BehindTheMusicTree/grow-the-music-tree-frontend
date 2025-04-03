import PropTypes from "prop-types";
import { useState } from "react";

import { TrackService } from "../../../utils/services";
import { useGenrePlaylists } from "../../../contexts/genre-playlists/useGenrePlaylists";
import { useTrackList } from "../../../contexts/track-list/useTrackList";
import { formatTime } from "../../../utils";
import { FORM_RATING_NULL_VALUE } from "../../../utils/constants";
import Rating from "../../utils/Rating";

export default function LibTrackEditionPopupChild({ popupContentObject, hide }) {
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const { refreshLibTrack } = useTrackList();
  const [formValues, setFormValues] = useState({
    title: popupContentObject.libTrack.title,
    artistName: popupContentObject.libTrack.artist ? popupContentObject.libTrack.artist.name : "",
    genreName: popupContentObject.libTrack.genre ? popupContentObject.libTrack.genre.name : "",
    albumName: popupContentObject.libTrack.album ? popupContentObject.libTrack.album.name : "",
    rating: popupContentObject.libTrack.rating,
  });
  const genreNameBeforeEdition = popupContentObject.libTrack.genre?.name;

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let submittedValues = { ...formValues };
    if (submittedValues.rating === FORM_RATING_NULL_VALUE) {
      submittedValues.rating = null;
    }
    const updatedLibTrack = await TrackService.putLibTrack(popupContentObject.libTrack.uuid, formValues);
    refreshLibTrack(updatedLibTrack);
    if (genreNameBeforeEdition !== updatedLibTrack.genre?.name) {
      setRefreshGenrePlaylistsSignal(1);
    }
    hide();
  };

  return (
    <div className="TrackEdition w-full max-w-2xl mx-auto px-5 py-2 shadow-md">
      <form className="Form flex flex-col" onSubmit={handleSubmit}>
        <div className="columns flex justify-between">
          <div className="title popup-content-column">
            <label className="popup-content-label">
              <span>Title:</span>
              <input
                className="popup-content-input"
                type="text"
                name="title"
                value={formValues.title}
                onChange={handleChange}
              />
            </label>
            <label className="artist popup-content-label">
              <span>Artist:</span>
              <input
                className="popup-content-input"
                type="text"
                name="artistName"
                value={formValues.artistName}
                onChange={handleChange}
              />
            </label>
            <label className="genre popup-content-label">
              <span>Genre:</span>
              <input
                className="popup-content-input"
                type="text"
                name="genreName"
                value={formValues.genreName}
                onChange={handleChange}
              />
            </label>
            <label className="genre popup-content-label">
              <span>Duration:</span>
              <div className="popup-content-input-readonly inline-block">
                {formatTime(popupContentObject.libTrack.file.durationInSec)}
              </div>
            </label>
          </div>
          <div className="popup-content-column">
            <label className="popup-content-label">
              <span>Added on:</span>
              <div className="popup-content-input-readonly inline-block mr-1">
                {new Date(popupContentObject.libTrack.createdOn).toLocaleDateString()}
              </div>
              <span className="flex-grow"></span>
            </label>
            <label className="popup-content-label">
              <span>Album:</span>
              <input
                className="popup-content-input"
                type="text"
                name="albumName"
                value={formValues.albumName}
                onChange={handleChange}
              />
            </label>
            <div className="flex items-center h-10">
              {" "}
              <span className="mr-2">Rating:</span>
              <Rating rating={formValues.rating} handleChange={handleChange} />
              <span className="flex-grow"></span>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="popup-content-input-readonly inline-block mr-1">
            {popupContentObject.libTrack.file.filename}
          </div>
        </div>
        <div>
          <div className="popup-content-input-readonly inline-block mr-1">
            {popupContentObject.libTrack.file.sizeInMo} Mo
          </div>
          <div className="popup-content-input-readonly inline-block">
            {popupContentObject.libTrack.file.bitrateInKbps} kbps
          </div>
        </div>
        <div className="flex">
          <span className="flex-grow"></span>
          <button className="popup-content-button" type="submit">
            Save
          </button>
          <span className="flex-grow"></span>
        </div>
      </form>
    </div>
  );
}

LibTrackEditionPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
  hide: PropTypes.func.isRequired,
};
