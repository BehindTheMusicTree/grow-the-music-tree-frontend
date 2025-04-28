"use client";

import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { CriteriaCreationValues } from "@domain/genre/form";

type GenreCreationPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  onSubmit: (values: CriteriaCreationValues) => void;
  onClose?: () => void;
  formErrors?: { field: string; message: string }[];
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class GenreCreationPopup extends BasePopup<GenreCreationPopupProps> {
  state = {
    name: "",
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.onSubmit({ name: this.state.name });
  };

  render() {
    const { onClose, formErrors, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Create Genre",
      isDismissable: true,
      children: (
        <form onSubmit={this.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
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
          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save
            </Button>
          </div>
        </form>
      ),
    });
  }
}
