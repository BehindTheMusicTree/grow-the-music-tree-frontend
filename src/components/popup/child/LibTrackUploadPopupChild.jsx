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
        // console.log("Error posting file " + file.name);
        if (error instanceof BadRequestError) {
          console.log("error " + error);
          setRequestErrorsByFilename((requestErrorsByFilename) => {
            const res = requestErrorsByFilename.concat({ filename: file.name, requestErrors: error.requestErrors });
            return res;
          });
        }
      }
    }

    async function handleLibTrackToPosts(files, genreUuid) {
      await Promise.allSettled(files.map((file) => handleLibTrackToPost(file, genreUuid)));
    }

    if (isPosting) {
      handleLibTrackToPosts(popupContentObject.files, popupContentObject.genreUuid).then(() => {
        setIsPosting(false);
        // console.log("fini");
        // console.log("requestErrorsByFilename " + requestErrorsByFilename);
      });
    }
  }, [isPosting, postLibTrack]);

  return (
    <div>
      {isPosting ? (
        <div>
          <div>
            {Object.entries(uploadProgress).map(([fileName, { size, progress }]) => (
              <div key={fileName} className="flex items-center">
                <div className="w-128 mr-4">{fileName}</div>
                <div className="flex-grow h-3 bg-gray-200 rounded-md overflow-hidden mr-4">
                  <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="w-16">{(size / 1048576).toFixed(2)} Mo</div>{" "}
              </div>
            ))}
            {/* <div key={id} className="flex">
              <div>Name: {file.name}</div>
              <div>Size: {(file.size / 1048576).toFixed(2)} Mo</div>{" "}
              <div>Last Modified: {new Date(file.lastModified).toLocaleString()}</div>
            </div> */}
          </div>
        </div>
      ) : requestErrorsByFilename.length > 0 ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occured</h3>
          </div>
          {/* {requestErrorsByFilename.map(({ filename, requestErrors }) => (
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
          ))} */}
        </div>
      ) : null}
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
