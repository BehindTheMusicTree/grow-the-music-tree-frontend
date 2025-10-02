"use client";

import { BasePopup } from "../BasePopup";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

type GenreRenamePopupProps = {
  onSubmit: (values: { name: string }) => void;
  onClose?: () => void;
  formErrors?: Array<{ field: string; message: string }>;
  genre: CriteriaMinimum;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class GenreRenamePopup extends BasePopup<GenreRenamePopupProps> {
  state = {
    name: this.props.genre.name,
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.onSubmit({ name: this.state.name });
  };

  handleOkClick = () => {
    this.props.onSubmit({ name: this.state.name });
  };

  render() {
    const { onClose, formErrors, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Rename Genre",
      isDismissable: true,
      showOkButton: true,
      showCancelButton: true,
      okButtonText: "Save",
      cancelButtonText: "Cancel",
      onOk: this.handleOkClick,
      onCancel: onClose,
      children: (
        <form onSubmit={this.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={this.state.name}
              onChange={this.handleChange}
              className="w-full px-3 py-2 border rounded-md"
              autoFocus
            />
          </div>
          {formErrors && formErrors.length > 0 && (
            <div className="flex justify-end gap-3">
              {formErrors.map((error) => (
                <p key={error.field} className="text-red-500">
                  {error.message}
                </p>
              ))}
            </div>
          )}
        </form>
      ),
    });
  }
}
