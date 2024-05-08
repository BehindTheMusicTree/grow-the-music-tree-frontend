import PropTypes from "prop-types";
import { useState } from "react";
// import { AiOutlineStar, AiFillStar } from "react-icons/ai";
// import { AiFillStar } from "react-icons/ai";

import ApiService from "../../../utils/service/apiService";
import { formatTime } from "../../../utils";

export default function LibTrackEditionPopupChild({ popupContentObject, hidePopup }) {
  const [formValues, setFormValues] = useState({
    title: popupContentObject.libTrack.title,
    artistName: popupContentObject.libTrack.artist ? popupContentObject.libTrack.artist.name : "",
    genreName: popupContentObject.libTrack.genre ? popupContentObject.libTrack.genre.name : "",
    albumName: popupContentObject.libTrack.album ? popupContentObject.libTrack.album.name : "",
    rating: popupContentObject.libTrack.rating ? popupContentObject.libTrack.rating : null,
  });

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await ApiService.putLibTrack(popupContentObject.libTrack.uuid, formValues);
    popupContentObject.handleUpdatedLibTrack(response);
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
            <label className="popup-content-label flex flex-col mb-4">
              <span>Rating:</span>
              {formValues.rating}
              <div className="flex">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="relative">
                    <input
                      id={`star-${i}`}
                      // className="popup-content-input w-6 h-6 absolute opacity-0 peer"
                      className="popup-content-input w-6 h-6  peer"
                      type="radio"
                      name="rating"
                      value={i + 5}
                      checked={formValues.rating === i + 5}
                      onChange={handleChange}
                    />
                    {/* <label htmlFor={`star-${i}`} className="cursor-pointer"> */}
                    {/* <AiOutlineStar className="w-6 h-6 text-gray-400" /> */}
                    {/* <AiFillStar className="w-6 h-6 text-yellow-500 absolute top-0 left-0 hidden peer-checked:block" /> */}
                    {/* </label> */}
                  </div>
                ))}
              </div>
            </label>
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
