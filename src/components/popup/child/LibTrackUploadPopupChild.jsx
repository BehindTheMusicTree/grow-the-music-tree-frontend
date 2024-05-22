import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { MdError } from "react-icons/md";

import { useLibTracks } from "../../../contexts/lib-tracks/useLibTracks";
import { BadRequestError } from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadPopupChild({ popupContentObject }) {
  const { postLibTrack } = useLibTracks();
  const [requestErrorsByFilename, setRequestErrorsByFilename] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (popupContentObject && !isPosting) {
      setIsPosting(true);
    }
  }, [popupContentObject, isPosting]);

  useEffect(() => {
    async function handleLibTrackToPost(file, genreUuid) {
      try {
        console.log("file " + file.name);
        await postLibTrack(file, genreUuid);
      } catch (error) {
        if (error instanceof BadRequestError) {
          setRequestErrorsByFilename((requestErrorsByFilename) => {
            return requestErrorsByFilename.concat({ filename: file.name, requestErrors: error.requestErrors });
          });
        }
      }
    }

    async function handleLibTrackToPosts(files, genreUuid) {
      await Promise.all(files.map((file) => handleLibTrackToPost(file, genreUuid)));
    }

    if (isPosting) {
      handleLibTrackToPosts(popupContentObject.files, popupContentObject.genreUuid).then(() => {
        setIsPosting(false);
      });
    }
  }, [isPosting, postLibTrack]);

  return (
    <div>
      {isPosting ? (
        <div>
          <div>
            {popupContentObject.files.map((file, id) => {
              return (
                <div key={id} className="flex">
                  <div>Name: {file.name}</div>
                  <div>Size: {file.size} bytes</div>
                  <div>Last Modified: {new Date(file.lastModified).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : requestErrorsByFilename.length > 0 ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occured</h3>
          </div>
          {requestErrorsByFilename.map(({ filename, requestErrors }) => (
            <div key={filename}>
              <div>{filename}</div>
              {requestErrors.map(([fieldName, fieldErrors]) => (
                <div key={fieldName} className="flex">
                  <h3 className="mr-2">{fieldName}</h3>
                  <ul>
                    {fieldErrors.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
