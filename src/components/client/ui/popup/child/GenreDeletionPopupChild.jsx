import PropTypes from "prop-types";
import { useGenrePlaylists } from "@/contexts/GenrePlaylistContext";
import { usePopup } from "@/contexts/PopupContext";
import Button from "@/components/client/ui/Button";
import ApiErrorPopupContentObject from "@models/popup-content-object/ApiErrorPopupContentObject";

export default function GenreDeletionPopupChild({ hide, popupContentObject }) {
  const { deleteGenre } = useGenrePlaylists();
  const { showPopup } = usePopup();
  const { genre } = popupContentObject;

  const handleDeleteGenre = async () => {
    const result = await deleteGenre(genre.uuid);
    if (result.success) {
      hide();
    } else {
      showPopup(new ApiErrorPopupContentObject(result.error));
    }
  };

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-left">
        Are you sure you want to delete the genre <strong>{genre.name}</strong>?
      </p>
      <div className="text-left mb-6">
        <p className="mb-2">
          • Subgenres will be {genre.parent ? `attached to "${genre.parent.name}"` : "moved to root level"}
        </p>
        <p>• Tracks in this genre will be {genre.parent ? `moved to "${genre.parent.name}"` : "marked as genreless"}</p>
      </div>
      <div className="flex justify-center gap-4">
        <Button onClick={hide} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Cancel
        </Button>
        <Button
          onClick={handleDeleteGenre}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

GenreDeletionPopupChild.propTypes = {
  hide: PropTypes.func.isRequired,
  popupContentObject: PropTypes.shape({
    genre: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      parent: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }).isRequired,
};
