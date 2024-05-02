import { usePopup } from '../../contexts/usePopup';

export default function Popup() {
  const { popupObject, hidePopup } = usePopup();

  if (!popupObject) {
    return null;
  }

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{popupObject.title}</h2>
        <p>{popupObject.message}</p>
        <button onClick={hidePopup}>Fermer</button>
      </div>
    </div>
  );
}