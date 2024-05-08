import PropTypes from "prop-types";

import { useForm } from "react-hook-form";

import ApiService from "../../../utils/service/apiService";
import { formatTime } from "../../../utils";

export default function LibTrackEdition({ popupContentObject, hidePopup }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: popupContentObject.libTrack.title,
      artistName: popupContentObject.libTrack.artist ? popupContentObject.libTrack.artist.name : "",
      genreName: popupContentObject.libTrack.genre ? popupContentObject.libTrack.genre.name : "",
      albumName: popupContentObject.libTrack.album ? popupContentObject.libTrack.album.name : "",
    },
  });

  const onSubmit = async (data) => {
    const response = await ApiService.putLibTrack(popupContentObject.libTrack.uuid, data);
    popupContentObject.handleUpdatedLibTrack(response);
    hidePopup();
  };

  return (
    <div className="TrackEdition w-full max-w-2xl mx-auto px-5 py-2 shadow-md">
      <form className="Form flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="columns flex justify-between">
          <div className="title popup-content-column">
            <label className="popup-content-label">
              <span>Title:</span>
              <input className="popup-content-input" type="text" {...register("title")} />
            </label>
            <label className="artist popup-content-label">
              <span>Artist:</span>
              <input className="popup-content-input" type="text" {...register("artistName")} />
            </label>
            <label className="genre popup-content-label">
              <span>Genre:</span>
              <input className="popup-content-input" type="text" {...register("genreName")} />
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
              <input className="popup-content-input" type="text" {...register("albumName")} />
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

LibTrackEdition.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
  hidePopup: PropTypes.func.isRequired,
};
