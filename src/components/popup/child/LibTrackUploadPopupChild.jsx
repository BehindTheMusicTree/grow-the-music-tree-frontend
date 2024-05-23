import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { MdError, MdCheckCircle } from "react-icons/md";

import { useLibTracks } from "../../../contexts/lib-tracks/useLibTracks";
import { BadRequestError } from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadPopupChild({ popupContentObject }) {
  const { postLibTrack } = useLibTracks();
  const [isPosting, setIsPosting] = useState(false);
  const [filesUploadObjs, setFilesUploadObjs] = useState({});

  useEffect(() => {
    if (popupContentObject && !isPosting) {
      popupContentObject.files.forEach((file) => {
        setFilesUploadObjs((prevUploadObj) => ({
          ...prevUploadObj,
          [file.name]: { size: file.size, progress: 0, isPosting: false, requestErrors: {} },
        }));
      });
      setIsPosting(true);
    }
  }, [popupContentObject]);

  useEffect(() => {
    async function handleLibTrackToPost(file, genreUuid) {
      try {
        await postLibTrack(file, genreUuid, (progress) => {
          setFilesUploadObjs((prevFilesUploadObjs) => ({
            ...prevFilesUploadObjs,
            [file.name]: { ...prevFilesUploadObjs[file.name], progress },
          }));
        });
      } catch (error) {
        if (error instanceof BadRequestError) {
          setFilesUploadObjs((fileUploadObj) => ({
            ...fileUploadObj,
            [file.name]: { ...fileUploadObj[file.name], requestErrors: error.requestErrors },
          }));
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

  return (
    <div>
      <div>
        <div>
          {Object.entries(filesUploadObjs).map(([filename, uploadObj]) => {
            console.log(JSON.stringify(uploadObj, null, 2));
            return (
              <div key={filename} className="h-8 flex items-center">
                {uploadObj.requestErrors.length > 0 ? (
                  <MdError size={20} color="red" className="mr-1" />
                ) : (
                  <MdCheckCircle size={20} color="green" className="mr-1" />
                )}
                <div className="w-2/5 mr-4 text-overflow">{filename}</div>
                <div className="center flex-grow mr-2">
                  {uploadObj.requestErrors.length > 0 ? (
                    <div>
                      {uploadObj.requestErrors.map((fieldsErrors, errorIndex) => {
                        return Object.entries(fieldsErrors).map(([fieldName, fieldErrors], index) => {
                          return fieldErrors.map((fieldError, subIndex) => {
                            return (
                              <div key={`${fieldName}-${errorIndex}-${index}-${subIndex}`} className="text-left">
                                {fieldError}
                              </div>
                            );
                          });
                        });
                      })}
                    </div>
                  ) : (
                    <div className="h-4 bg-gray-200 rounded-md overflow-hidden mr-4 relative">
                      <div className="bg-blue-500 h-full" style={{ width: `${uploadObj.progress}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
                        {Math.round(uploadObj.progress)}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-16">{(uploadObj.size / 1048576).toFixed(2)} Mo</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* requestErrorsByFilename.length > 0 ? (
        <div>
          {requestErrorsByFilename.map((errorObj) => {
            const filename = Object.keys(errorObj)[0];
            const fileErrors = errorObj[filename];

            return (
              <div key={filename} className="file-errors h-8 flex items-center">
                <div className="mr-2 flex items-center">
                  <MdError size={20} color="red" className="mr-1" />
                  <div>{filename}</div>
                </div>
                {fileErrors.map((fileErrorObj) => {
                  const fieldName = Object.keys(fileErrorObj)[0];
                  const fieldErrors = fileErrorObj[fieldName];

                  return (
                    <div key={filename + fieldName} className="flex">
                      <div className="mr-2">{fieldName}</div>
                      <ul>
                        {fieldErrors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null} */}
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
