import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { MdError, MdCheckCircle } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

import { useLibTracks } from "../../../contexts/lib-tracks/useLibTracks";
import BadRequestError from "../../../utils/errors/BadRequestError";

export default function LibTrackUploadPopupChild({ popupContentObject }) {
  const { postLibTrack, setRefreshLibTracksSignal } = useLibTracks();
  const [isPosting, setIsPosting] = useState(false);
  const [filesUploadObjs, setFilesUploadObjs] = useState({});

  const setFileUploadObjIsPosting = (filename, isPosting) => {
    setFilesUploadObjs((prevFileUploadObj) => ({
      ...prevFileUploadObj,
      [filename]: { ...prevFileUploadObj[filename], isPosting: isPosting },
    }));
  };

  useEffect(() => {
    if (popupContentObject && !isPosting) {
      setIsPosting(true);
    }
  }, [popupContentObject]);

  useEffect(() => {
    async function handleLibTrackToPost(file, genreUuid) {
      setFileUploadObjIsPosting(file.name, true);
      try {
        await postLibTrack(
          file,
          genreUuid,
          (progress) => {
            setFilesUploadObjs((prevFilesUploadObjs) => ({
              ...prevFilesUploadObjs,
              [file.name]: { ...prevFilesUploadObjs[file.name], progress },
            }));
          },
          true
        );
        setFileUploadObjIsPosting(file.name, false);
      } catch (error) {
        if (error instanceof BadRequestError) {
          setFilesUploadObjs((prevFileUploadObj) => ({
            ...prevFileUploadObj,
            [file.name]: { ...prevFileUploadObj[file.name], requestErrors: error.requestErrors },
          }));
        }
        setFileUploadObjIsPosting(file.name, false);
      }
    }

    async function handleLibTracksToPost(files, genreUuid) {
      await Promise.allSettled(files.map((file) => handleLibTrackToPost(file, genreUuid)));
    }

    if (isPosting) {
      popupContentObject.files.forEach((file) => {
        setFilesUploadObjs((prevUploadObj) => ({
          ...prevUploadObj,
          [file.name]: { size: file.size, progress: 0, isPosting: false, requestErrors: {} },
        }));
      });
      handleLibTracksToPost(popupContentObject.files, popupContentObject.genreUuid).then(() => {
        setRefreshLibTracksSignal(1);
        setIsPosting(false);
      });
    }
  }, [isPosting]);

  return (
    <div>
      <div>
        <div>
          {Object.entries(filesUploadObjs).map(([filename, uploadObj]) => {
            return (
              <div key={filename} className="h-8 flex items-center">
                <div className="icon-container mr-2">
                  {uploadObj.isPosting ? (
                    <FaSpinner size={18} className="animate-spin fill-current text-gray-400" />
                  ) : uploadObj.requestErrors.length > 0 ? (
                    <MdError size={20} color="red" className="mr-1" />
                  ) : (
                    <MdCheckCircle size={20} color="green" className="mr-1" />
                  )}
                </div>
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
    </div>
  );
}

LibTrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
