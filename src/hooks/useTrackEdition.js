"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUpdateUploadedTrack } from "@hooks/useUploadedTrack";
import UploadedTrackEditionPopup from "@components/ui/popup/child/UploadedTrackEditionPopup";
import { FORM_RATING_NULL_VALUE } from "@constants/rating";

export function useTrackEdition() {
  const [show, setShow] = useState(false);
  const [track, setTrack] = useState(null);
  const { mutate: updateTrack, isSuccess, isError, data: updatedTrack, error } = useUpdateUploadedTrack();

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

  useEffect(() => {
    if (isSuccess && updatedTrack) {
      setShow(false);
    }
  }, [isSuccess, updatedTrack]);

  useEffect(() => {
    if (isError && error) {
      // Close the edition popup when there's an error so the error popup can be displayed
      setShow(false);
    }
  }, [isError, error]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!track) return;

      let submittedValues = { ...formValues };
      // Handle rating values - remove rating field entirely if it's null, undefined, or FORM_RATING_NULL_VALUE (-1)
      if (
        submittedValues.rating === null ||
        submittedValues.rating === undefined ||
        submittedValues.rating === FORM_RATING_NULL_VALUE ||
        submittedValues.rating === -1
      ) {
        delete submittedValues.rating;
      }
      // Ensure rating is within valid range (0-5) or remove it
      else if (submittedValues.rating < 0 || submittedValues.rating > 5) {
        delete submittedValues.rating;
      }

      updateTrack({ uuid: track.uuid, data: submittedValues });
    },
    [track, formValues, updateTrack]
  );

  const TrackEditionComponent = useMemo(() => {
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
  }, [show, track, formValues, handleChange, handleSubmit]);

  return {
    showEditPopup,
    TrackEditionComponent,
  };
}
