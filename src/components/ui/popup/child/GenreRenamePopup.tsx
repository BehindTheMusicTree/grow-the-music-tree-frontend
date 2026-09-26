"use client";

import { useState } from "react";
import { BasePopup } from "@behindthemusictree/app-kit/popup";
import { CriteriaMinimum, useUpdateGenre } from "@behindthemusictree/app-kit/genre-tree";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

type GenreRenamePopupProps = {
  onClose: () => void;
  genre: CriteriaMinimum;
};

// Owns its mutation: showPopup stores a frozen element, so formErrors passed as props would never update.
export default function GenreRenamePopup({ onClose, genre }: GenreRenamePopupProps) {
  const [name, setName] = useState(genre.name);
  const { mutate, formErrors } = useUpdateGenre("reference", getGrowBackendBaseUrl);

  const submit = () => mutate({ uuid: genre.uuid, data: { name } }, { onSuccess: onClose });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <BasePopup
      title="Rename Genre"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Save"
      cancelButtonText="Cancel"
      onOk={submit}
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
          {formErrors.length > 0 && (
            <div className="flex justify-end gap-3">
              {formErrors.map((error, index) => (
                <p key={index} className="text-red-500">
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
