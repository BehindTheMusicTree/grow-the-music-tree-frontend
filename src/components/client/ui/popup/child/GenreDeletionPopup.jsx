import React from "react";
import PropTypes from "prop-types";
import BasePopup from "./BasePopup";

export default function GenreDeletionPopup({ genre, onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm(genre);
    onClose();
  };

  return (
    <BasePopup title="Delete Genre" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete the genre &quot;{genre.name}&quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </BasePopup>
  );
}

GenreDeletionPopup.propTypes = {
  genre: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
