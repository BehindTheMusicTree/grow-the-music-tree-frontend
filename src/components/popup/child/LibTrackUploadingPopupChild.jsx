import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

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
          {requestErrors &&
            requestErrors.map((operationError) =>
              Object.entries(operationError).map(([fieldName, fieldErrors]) => (
                <div key={fieldName}>
                  <h3>{fieldName}</h3>
                  <ul>
                    {fieldErrors.map((error) => (
                      <li key={error}>{error}</li>
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
