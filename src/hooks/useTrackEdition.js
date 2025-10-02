"use client";

import { useState } from "react";
import { useUpdateUploadedTrack } from "@hooks/useUploadedTrack";
import { useTrackList } from "@contexts/TrackListContext";
import UploadedTrackEditionPopup from "@components/ui/popup/child/UploadedTrackEditionPopup";
import { FORM_RATING_NULL_VALUE } from "@constants/rating";

export function useTrackEdition() {
  const [show, setShow] = useState(false);
  const [track, setTrack] = useState(null);
  const { refreshUploadedTrack } = useTrackList();
  const { mutate: updateTrack } = useUpdateUploadedTrack();

  const [formValues, setFormValues] = useState({
    title: "",
    artists_names: "",
    genre: "",
    album_name: "",
    rating: null,
  });

  const showEditPopup = (track) => {
    setTrack(track);
    setFormValues({
      title: track.title || "",
      artists_names: track.artists?.map((artist) => artist.name).join(", ") || "",
      genre: track.genre?.name || "",
      album_name: track.album?.name || "",
      rating: track.rating,
    });
    setShow(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!track) return;

    let submittedValues = { ...formValues };
    if (submittedValues.rating === FORM_RATING_NULL_VALUE) {
      submittedValues.rating = null;
    }

    updateTrack(
      { uuid: track.uuid, data: submittedValues },
      {
        onSuccess: (updatedTrack) => {
          refreshUploadedTrack(updatedTrack);
          setShow(false);
        },
      }
    );
  };

  const TrackEditionComponent = () => {
    if (!show || !track) return null;

    return (
      <UploadedTrackEditionPopup
        onClose={() => setShow(false)}
        uploadedTrack={track}
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
