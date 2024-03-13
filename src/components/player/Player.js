import React, { useState, useEffect } from 'react'
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'

const Player = () => {
  const LIBRARY_TRACK_SAMPLE_UUID = `joy8KSUE3L57QzUdH7LZNL`

  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [playing, setPlaying] = useState(false);
  const [libraryTrack, setLibraryTrack] = useState();

  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePause = () => {
    setPlaying(false);
  }

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${blobUrl}: ${err}`);
  }

  const getLibraryTrack = async () => {
    const libraryTrackUuid = LIBRARY_TRACK_SAMPLE_UUID
    const libraryTrack = await ApiService.retrieveLibraryTrack(libraryTrackUuid)
    setLibraryTrack(libraryTrack)
  }

  const getLibraryTrackBlobUrl = async () => {
    const blobUrl = await ApiService.getLibraryTrackAudio(libraryTrack.relativeUrl)
    setBlobUrl(blobUrl);
  }

  useEffect(() => {
    if (!isLoadingStream) {
      setIsLoadingStream(true);
    }
  }, []);

  useEffect(() => {
    if (isLoadingStream) {
      setIsLoadingStream(false);
      getLibraryTrack();
    }
  }, [isLoadingStream]);

  useEffect(() => {
    if (libraryTrack) {
      getLibraryTrackBlobUrl();
    }
  }, [libraryTrack])

  return (
    <div>
      {blobUrl ?  (
        <>
          <ReactHowler
            src={[blobUrl]}
            html5={true}
            playing={playing}
            format={[libraryTrack.fileExtension.replace('.', '')]}
            onLoadError={handleLoadError}
          />
          <Button onClick={handlePlay}>Play</Button>
          <Button onClick={handlePause}>Pause</Button>
        </>
      ) : (
        <p>Loading audio stream...</p>
      )}
    </div>
  )
}

export default Player