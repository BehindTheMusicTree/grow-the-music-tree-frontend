"use client";

import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { GenreCreationValues } from "@schemas/genre/form";

type GenreCreationPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  onSubmit: (values: GenreCreationValues) => void;
  onClose?: () => void;
};

// @ts-expect-error: title, children, icon, isDismissable are set internally by the popup
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
    const { onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Create Genre",
      isDismissable: true,
      children: (
        <form onSubmit={this.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleChange}
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
