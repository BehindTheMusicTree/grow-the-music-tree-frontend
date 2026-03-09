"use client";

import { useState } from "react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

type GenreCreationPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  onSubmit: (values: { name: string; parent?: string }) => void;
  onClose?: () => void;
  formErrors?: { field: string; message: string }[];
  parent?: CriteriaMinimum | null;
};

export default function GenreCreationPopup({
  onSubmit,
  onClose,
  formErrors,
  parent,
  ...rest
}: GenreCreationPopupProps) {
  const [name, setName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, parent: parent?.uuid || undefined });
  };

  const handleOkClick = () => {
    onSubmit({ name, parent: parent?.uuid || undefined });
  };

  return (
    <BasePopup
      {...rest}
      onClose={onClose}
      title="Create Genre"
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Save"
      cancelButtonText="Cancel"
      onOk={handleOkClick}
      onCancel={onClose}
      children={
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <input
                type="text"
                name="parent"
                value={parent?.name || "(root genre)"}
                className="w-full px-3 py-2 border rounded-md"
                disabled
              />
            </div>
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
