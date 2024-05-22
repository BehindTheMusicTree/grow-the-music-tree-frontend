import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { MdError } from "react-icons/md";

import ApiService from "../../../utils/service/apiService";
import { useGenrePlaylists } from "../../../contexts/genre-playlists/useGenrePlaylists";
import { BadRequestError } from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadPopupChild({ popupContentObject, hide }) {
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const [requestErrors, setRequestErrors] = useState();
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    async function postLibTrack(file, genreUuid) {
      try {
        await ApiService.postLibTracks(file, genreUuid);
        setRefreshGenrePlaylistsSignal(1);
      } catch (error) {
        if (error instanceof BadRequestError) {
          setRequestErrors((requestErrors) => {
            return requestErrors.concat(error.requestErrors);
          });
        }
      }
      setIsPosting(false);
    }

    async function postLibTracks(files, genreUuid) {
      await Promise.all(files.map((file) => postLibTrack(file, genreUuid)));
    }

    if (popupContentObject && !isPosting.current) {
      setIsPosting(true);
      postLibTracks(popupContentObject.files, popupContentObject.genreUuid).then(() => {
        hide();
      });
    }
  }, [popupContentObject]);

  return (
    <div>
      {isPosting ? (
        <div>
          <h3>Uploading...</h3>
          <div>
            {popupContentObject.files.map((file, id) => {
              return <div key={id}>{file.name}</div>;
            })}
          </div>
        </div>
      ) : requestErrors ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occured</h3>
          </div>
          {requestErrors.map((operationError) =>
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
      ) : null}
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
  hide: PropTypes.func.isRequired,
};
