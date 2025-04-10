import PopupContentObject from "./PopupContentObject";

export default class GenreDeletionPopupContentObject extends PopupContentObject {
  constructor(genre) {
    super("Delete Genre", "GenreDeletionPopupContentObject");
    this.genre = genre;
  }
}