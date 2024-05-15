import PropTypes from "prop-types";
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

import ApiService from "../../../utils/service/apiService";
import { useGenrePlaylists } from "../../../contexts/genre-playlists/useGenrePlaylists";
import { usePlaylistPlayObject } from "../../../contexts/playlist-play-object/usePlaylistPlayObject";
import { formatTime } from "../../../utils";

export default function LibTrackEditionPopupChild({ popupContentObject, hidePopup }) {
  const FORM_RATING_NULL_VALUE = -1;
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const { setPlaylistPlayObject } = usePlaylistPlayObject();
  const [formValues, setFormValues] = useState({
    title: popupContentObject.libTrack.title,
    artistName: popupContentObject.libTrack.artist ? popupContentObject.libTrack.artist.name : "",
    genreName: popupContentObject.libTrack.genre ? popupContentObject.libTrack.genre.name : "",
    albumName: popupContentObject.libTrack.album ? popupContentObject.libTrack.album.name : "",
    rating: popupContentObject.libTrack.rating,
  });

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdatedLibTrack = async (updatedLibTrack) => {
    setPlaylistPlayObject((currentState) => {
      const newState = { ...currentState };
      const oldTrack = newState.contentObject.libraryTracks.find(
        (track) => track.libraryTrack.uuid === updatedLibTrack.uuid
      );
      const genreChanged = oldTrack && oldTrack.libraryTrack.genre !== updatedLibTrack.genre;

      newState.contentObject.libraryTracks = newState.contentObject.libraryTracks.map((playlistTrackRelation) =>
        playlistTrackRelation.libraryTrack.uuid === updatedLibTrack.uuid
          ? { ...playlistTrackRelation, libraryTrack: updatedLibTrack }
          : playlistTrackRelation
      );

      if (genreChanged) {
        setRefreshGenrePlaylistsSignal(1);
      }

      return newState;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let submittedValues = { ...formValues };
    if (submittedValues.rating === FORM_RATING_NULL_VALUE) {
      submittedValues.rating = null;
    }
    const response = await ApiService.putLibTrack(popupContentObject.libTrack.uuid, formValues);
    handleUpdatedLibTrack(response);
    hidePopup();
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
                {formatTime(popupContentObject.libTrack.duration)}
              </div>
            </label>
          </div>
          <div className="popup-content-column">
            <label className="popup-content-label">
              <span>Added on:</span>
              <div className="popup-content-input-readonly inline-block mr-1">
                {new Date(popupContentObject.libTrack.addedOn).toLocaleDateString()}
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
              <div className="flex items-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`relative ${i === 0 ? "mr-4" : "mr-1"}`}>
                    <input
                      id={`star-${i}`}
                      className="w-6 h-6 opacity-0"
                      type="radio"
                      name="rating"
                      value={i === 0 ? FORM_RATING_NULL_VALUE : i + 5}
                      checked={formValues.rating === (i === 0 ? null : i + 5)}
                      onChange={handleChange}
                    />
                    <label htmlFor={`star-${i}`} className="cursor-pointer">
                      {i === 0 ? (
                        <div className="flex">
                          <AiOutlineStar
                            className={`w-7 h-7 absolute top-0 left-0 ${
                              formValues.rating === FORM_RATING_NULL_VALUE ? "text-yellow-500" : "text-gray-500"
                            }`}
                          />
                          <span className="flex-grow w-8"></span>{" "}
                        </div>
                      ) : (
                        <AiFillStar
                          className={`w-7 h-7 absolute top-0 left-0 ${
                            formValues.rating >= i + 5 ? "text-yellow-500" : "text-gray-500"
                          }`}
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
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
  hidePopup: PropTypes.func.isRequired,
};
