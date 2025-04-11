"use client";

import { useState } from "react";

export default function TrackUploader() {
  const [file, setFile] = useState(null);
  const [genreUuid, setGenreUuid] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (genreUuid) {
        formData.append("genre", genreUuid);
      }
      await fetch("/api/uploaded-tracks", {
        method: "POST",
        body: formData,
      });
      setFile(null);
      setGenreUuid("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="file">Track File:</label>
        <input
          type="file"
          id="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={isUploading}
        />
      </div>
      <div>
        <label htmlFor="genre">Genre:</label>
        <input
          type="text"
          id="genre"
          value={genreUuid}
          onChange={(e) => setGenreUuid(e.target.value)}
          disabled={isUploading}
        />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Track"}
      </button>
    </form>
  );
}
