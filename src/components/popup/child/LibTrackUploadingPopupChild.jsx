import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

import ApiService from "../../../utils/service/apiService";
import { useRefreshGenrePlaylistsSignal } from "../../../contexts/refresh-genre-playlists-signal/useRefreshGenrePlaylistsSignal.jsx";

export default function LibTrackUploadingPopupChild({ popupContentObject, hidePopup }) {
  const { setRefreshGenrePlaylistsSignal } = useRefreshGenrePlaylistsSignal();
  const isPostingRef = useRef(false);

  useEffect(() => {
    async function postLibTracks(file, genreUuid) {
      await ApiService.postLibTracks(file, genreUuid);
      isPostingRef.current = false;
      setRefreshGenrePlaylistsSignal(1);
      hidePopup();
    }

    if (popupContentObject && !isPostingRef.current) {
      isPostingRef.current = true;
      postLibTracks(popupContentObject.file, popupContentObject.genreUuid);
    }
  }, [popupContentObject]);
  return <div>Uploading...</div>;
}

LibTrackUploadingPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
  hidePopup: PropTypes.func.isRequired,
};
