"use client";

import { BasePopup, BasePopupProps } from "../BasePopup";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

type GenreCreationPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  onSubmit: (values: { name: string; parent?: string }) => void;
  onClose?: () => void;
  formErrors?: { field: string; message: string }[];
  parent?: CriteriaMinimum | null;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class GenreCreationPopup extends BasePopup<GenreCreationPopupProps> {
  state = {
    parent: this.props.parent,
    name: "",
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.onSubmit({ name: this.state.name, parent: this.state.parent?.uuid || undefined });
  };

  handleOkClick = () => {
    this.props.onSubmit({ name: this.state.name, parent: this.state.parent?.uuid || undefined });
  };

  render() {
    const { onClose, formErrors, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Create Genre",
      isDismissable: true,
      showOkButton: true,
      showCancelButton: true,
      okButtonText: "Save",
      cancelButtonText: "Cancel",
      onOk: this.handleOkClick,
      onCancel: onClose,
      children: (
        <form onSubmit={this.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <input
                type="text"
                name="parent"
                value={this.state.parent?.name || "(root genre)"}
                className="w-full px-3 py-2 border rounded-md"
                disabled
              />
            </div>
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
