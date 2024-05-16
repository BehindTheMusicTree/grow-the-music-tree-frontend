import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

import { MdError } from "react-icons/md";

import ApiService from "../../../utils/service/apiService";
import { useGenrePlaylists } from "../../../contexts/genre-playlists/useGenrePlaylists";
import { BadRequestError } from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadingPopupChild({ popupContentObject, hidePopup }) {
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const [requestErrors, setRequestErrors] = useState();
  const isPostingRef = useRef(false);

  useEffect(() => {
    async function postLibTracks(file, genreUuid) {
      try {
        await ApiService.postLibTracks(file, genreUuid);
        setRefreshGenrePlaylistsSignal(1);
        hidePopup();
      } catch (error) {
        if (error instanceof BadRequestError) {
          setRequestErrors(error.requestErrors);
        }
      }
      isPostingRef.current = false;
    }

    if (popupContentObject && !isPostingRef.current) {
      isPostingRef.current = true;
      postLibTracks(popupContentObject.file, popupContentObject.genreUuid);
    }
  }, [popupContentObject]);

  return (
    <div>
      {requestErrors ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occured</h3>
          </div>
          {requestErrors &&
            requestErrors.map((operationError) =>
              Object.entries(operationError).map(([fieldName, fieldErrors]) => (
                <div key={fieldName} className="flex">
                  <h3 className="mr-2">{fieldName}</h3>
                  <ul>
                    {fieldErrors.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
        </div>
      ) : (
        <h3>Uploading...</h3>
      )}
    </div>
  );
}

LibTrackUploadingPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
  hidePopup: PropTypes.func.isRequired,
};
