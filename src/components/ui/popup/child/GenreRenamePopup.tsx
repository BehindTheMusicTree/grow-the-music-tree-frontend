"use client";

import { useState } from "react";
import { BasePopup } from "../BasePopup";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

type GenreRenamePopupProps = {
  onSubmit: (values: { name: string }) => void;
  onClose?: () => void;
  formErrors?: Array<{ field: string; message: string }>;
  genre: CriteriaMinimum;
};

export default function GenreRenamePopup({
  onSubmit,
  onClose,
  formErrors,
  genre,
}: GenreRenamePopupProps) {
  const [name, setName] = useState(genre.name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  const handleOkClick = () => {
    onSubmit({ name });
  };

  return (
    <BasePopup
      title="Rename Genre"
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Save"
      cancelButtonText="Cancel"
      onOk={handleOkClick}
      onCancel={onClose}
      onClose={onClose}
      children={
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
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
      }
    />
  );
}
