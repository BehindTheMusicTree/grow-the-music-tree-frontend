"use client";

import { useId } from "react";
import { z } from "zod";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

const AttachableSchema = z.array(
  z.object({ id: z.string().min(1), name: z.string().min(1), kind: z.string(), hidden: z.boolean() }).strict(),
);

type Props = {
  label: string;
  value: string;
  onChange: (entityId: string) => void;
};

/**
 * Picks the place a tradition is attached to: any region of the latest map, including the hidden subdivisions that
 * have no genre yet. The id stays editable, since a Glottocode names an entity the map does not list.
 */
export default function EntityPicker({ label, value, onChange }: Props) {
  const id = useId();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data } = useQueryWithParse({
    queryKey: ["regionMap", "attachable"],
    queryFn: () => fetch("regions/map/attachable/", true, false, {}),
    schema: AttachableSchema,
    context: "EntityPicker",
  });
  const current = data?.find((target) => target.id === value);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        list={`${id}-targets`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
      <datalist id={`${id}-targets`}>
        {data?.map((target) => (
          <option key={target.id} value={target.id}>
            {target.name}
            {target.hidden ? " (masquée)" : ""}
          </option>
        ))}
      </datalist>
      {current && <p className="text-caption text-gray-500">{current.name}</p>}
    </div>
  );
}
