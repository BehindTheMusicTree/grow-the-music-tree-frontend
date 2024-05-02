import { usePopup } from '../../contexts/usePopup';

export default function Popup() {
  const { popupObject, hidePopup } = usePopup();

  if (!popupObject) {
    return null;
  }

  return (
    <div className="popup">
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full relative">
                <h2>{popupObject.title}</h2>
                <p>{popupObject.message}</p>
                <button onClick={hidePopup}>Fermer</button>
            </div>
        </div>
    </div>
  );
}