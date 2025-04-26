"use client";

import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { GenreCreationValues } from "@schemas/genre/form";

type GenreCreationPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  formValues: GenreCreationValues;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
};

// @ts-expect-error: title, children, icon, isDismissable are set internally by the popup
export default class GenreCreationPopup extends BasePopup<GenreCreationPopupProps> {
  render() {
    const { formValues, onFormChange, onSubmit, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Create Genre",
      isDismissable: true,
      children: (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name ?? ""}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

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
