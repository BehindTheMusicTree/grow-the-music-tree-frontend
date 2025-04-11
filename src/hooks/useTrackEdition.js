"use client";

import { useState } from "react";
import { UploadedTrackService } from "@utils/services";
import { useGenrePlaylists } from "@/contexts/GenrePlaylistContext";
import { useTrackList } from "@/contexts/TrackListContext";
import { UploadedTrackEditionPopup } from "@/components/ui/popup/UploadedTrackEditionPopup";
import { FORM_RATING_NULL_VALUE } from "@lib/utils/constants";

export function useTrackEdition() {
  const [show, setShow] = useState(false);
  const [track, setTrack] = useState(null);
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const { refreshUploadedTrack } = useTrackList();

  const [formValues, setFormValues] = useState({
    title: "",
    artistName: "",
    genreName: "",
    albumName: "",
    rating: null,
  });

  const showEditPopup = (track) => {
    setTrack(track);
    setFormValues({
      title: track.title,
      artistName: track.artist?.name || "",
      genreName: track.genre?.name || "",
      albumName: track.album?.name || "",
      rating: track.rating,
    });
    setShow(true);
  };

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!track) return;

    let submittedValues = { ...formValues };
    if (submittedValues.rating === FORM_RATING_NULL_VALUE) {
      submittedValues.rating = null;
    }

    const updatedTrack = await UploadedTrackService.putUploadedTrack(track.uuid, submittedValues);

    refreshUploadedTrack(updatedTrack);
    if (track.genre?.name !== updatedTrack.genre?.name) {
      setRefreshGenrePlaylistsSignal(1);
    }

    setShow(false);
  };

  const TrackEditionComponent = () => {
    if (!show || !track) return null;

    return (
      <UploadedTrackEditionPopup
        onClose={() => setShow(false)}
        track={track}
        formValues={formValues}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
      />
    );
  };

  return {
    showEditPopup,
    TrackEditionComponent,
  };
}
