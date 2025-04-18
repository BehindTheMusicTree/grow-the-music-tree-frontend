"use client";

import React from "react";
import PropTypes from "prop-types";
import BasePopup from "./child/BasePopup";
import GenreDeletionPopup from "./child/GenreDeletionPopup";
import TrackUploadPopup from "./child/TrackUploadPopup";
import InvalidInputPopup from "./child/InvalidInputPopup";
import SpotifyAuthPopup from "./child/SpotifyAuthPopup";
import SpotifyAuthErrorPopup from "./child/SpotifyAuthErrorPopup";
import UploadedTrackEditionPopup from "./child/UploadedTrackEditionPopup";
import InternalErrorPopup from "./child/InternalErrorPopup";

function Popup({ type, content, onClose }) {
  switch (type) {
    case "networkError":
    case "error": // Handle both network and general errors
      return <InternalErrorPopup {...content} onClose={onClose} />;
    case "authError":
      return <SpotifyAuthErrorPopup {...content} onClose={onClose} />;
    case "spotifyAuth":
      return <SpotifyAuthPopup {...content} onClose={onClose} />;
    case "genreDeletion":
      return <GenreDeletionPopup {...content} onClose={onClose} />;
    case "trackUpload":
      return <TrackUploadPopup {...content} onClose={onClose} />;
    case "invalidInput":
      return <InvalidInputPopup {...content} onClose={onClose} />;
    case "trackEdition":
      return <UploadedTrackEditionPopup {...content} onClose={onClose} />;
    default:
      return <BasePopup onClose={onClose}>{content}</BasePopup>;
  }
}

Popup.propTypes = {
  type: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Popup;
