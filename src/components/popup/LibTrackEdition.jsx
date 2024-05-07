import PropTypes from "prop-types";

import { useForm } from "react-hook-form";

import ApiService from "../../utils/service/apiService";
import { formatTime } from "../../utils";

export default function LibTrackEdition({ popupContentObject }) {
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
    // libTrackEditionPopupContentObject.onClose();
  };

  return (
    <div className="TrackEdition w-full max-w-2xl mx-auto px-5 shadow-md">
      <form className="Form flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <label className="popup-content-label">
          <span>Filename:</span>
          <div className="popup-content-input-readonly inline-block">{popupContentObject.libTrack.file.filename}</div>
        </label>
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
          </div>
          <div className="popup-content-column">
            <label className="popup-content-label">
              <span>Duration:</span>
              <div className="popup-content-input-readonly inline-block">
                {formatTime(popupContentObject.libTrack.duration)}
              </div>
              <span className="flex-grow"></span>
            </label>
            <label className="popup-content-label">
              <span>Album:</span>
              <input className="popup-content-input" type="text" {...register("albumName")} />
            </label>
          </div>
        </div>
        <button className="popup-content-button" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}

LibTrackEdition.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
