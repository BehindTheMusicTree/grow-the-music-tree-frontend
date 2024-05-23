import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { MdError } from "react-icons/md";

import { useLibTracks } from "../../../contexts/lib-tracks/useLibTracks";
import { BadRequestError } from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadPopupChild({ popupContentObject }) {
  const { postLibTrack } = useLibTracks();
  const [requestErrorsByFilename, setRequestErrorsByFilename] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (popupContentObject && !isPosting) {
      // console.log("set isPosting true");
      setIsPosting(true);
    }
  }, [popupContentObject]);

  useEffect(() => {
    async function handleLibTrackToPost(file, genreUuid) {
      try {
        await postLibTrack(file, genreUuid, (progress) =>
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [file.name]: { size: file.size, progress: progress },
          }))
        );
      } catch (error) {
        console.log("Error posting file " + file.name);
        if (error instanceof BadRequestError) {
          console.log("error " + error);
          setRequestErrorsByFilename((requestErrorsByFilename) => [
            ...requestErrorsByFilename,
            { [file.name]: error.requestErrors },
          ]);
        }
      }
    }

    async function handleLibTrackToPosts(files, genreUuid) {
      await Promise.allSettled(files.map((file) => handleLibTrackToPost(file, genreUuid)));
    }

    if (isPosting) {
      handleLibTrackToPosts(popupContentObject.files, popupContentObject.genreUuid).then(() => {
        setIsPosting(false);
      });
    }
  }, [isPosting, postLibTrack]);

  useEffect(() => {
    console.log("requestErrorsByFilename " + JSON.stringify(requestErrorsByFilename));
  }, [requestErrorsByFilename]);

  return (
    <div>
      {requestErrorsByFilename.length}
      {isPosting ? (
        <div>
          <div>
            {Object.entries(uploadProgress).map(([filename, { size, progress }]) => (
              <div key={filename} className="flex items-center">
                <div className="w-1/2 mr-4">{filename}</div>
                <div className="flex-grow h-4 bg-gray-200 rounded-md overflow-hidden mr-4 relative">
                  <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
                    {Math.round(progress)}%
                  </div>
                </div>
                <div className="w-16">{(size / 1048576).toFixed(2)} Mo</div>{" "}
              </div>
            ))}
          </div>
        </div>
      ) : requestErrorsByFilename.length > 0 ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occured</h3>
          </div>
          {requestErrorsByFilename.map((errorObj) => {
            const filename = Object.keys(errorObj)[0];
            const fileErrors = errorObj[filename];

            return (
              <div key={filename}>
                <div>{filename}</div>
                {fileErrors.map((fileErrorObj) => {
                  const fieldName = Object.keys(fileErrorObj)[0];
                  const fieldErrors = fileErrorObj[fieldName];

                  return (
                    <div key={filename + fieldName} className="flex">
                      <h3 className="mr-2">{fieldName}</h3>
                      <ul>
                        {fieldErrors.map((error) => (
                          <li key={error}>- {error}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
