"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import GenrePicker from "@components/features/curation/GenrePicker";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  CurationEdgeSchema,
  EDGE_ACTIONS,
  EDGE_RELATIONS,
  type CurationEdge,
  type EdgeRelation,
} from "@schemas/api/curation";

type Props = {
  /** Absent when adding an edge. */
  edge?: CurationEdge;
  /** The genre a new edge is added for. */
  itemId?: string;
  labels: Record<string, string>;
  onClose: () => void;
};

const FIELD_TITLES: Record<string, string> = {
  relation: "Relation",
  item_id: "Genre",
  parent_item_id: "Parent",
  action: "Action",
  exclude_other_parents: "Exclure les autres parents",
  reason: "Raison",
};

const EdgeInputSchema = z.object({
  relation: z.enum(["canonical_parent", "regional_genre_parent", "regional_overview", "secondary_parent"]),
  item_id: z.string().min(1, "Choisir un genre"),
  parent_item_id: z.string().nullable(),
  action: z.enum(["add", "remove"]).nullable(),
  exclude_other_parents: z.boolean().nullable(),
  reason: z.string(),
});

type EdgeInput = z.infer<typeof EdgeInputSchema>;

/** An edge's shape depends on its relation: secondary parents carry an action, the others an exclusion flag. */
function reshape(input: EdgeInput, relation: EdgeRelation): EdgeInput {
  const secondary = relation === "secondary_parent";
  return {
    ...input,
    relation,
    action: secondary ? (input.action ?? "add") : null,
    exclude_other_parents: secondary ? null : (input.exclude_other_parents ?? false),
    parent_item_id: relation === "canonical_parent" ? input.parent_item_id : (input.parent_item_id ?? ""),
  };
}

export default function CurationEdgeEditor({ edge, itemId, labels, onClose }: Props) {
  const id = useId();
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [input, setInput] = useState<EdgeInput>(() =>
    edge
      ? { ...edge.row }
      : reshape(
          {
            relation: "canonical_parent",
            item_id: itemId ?? "",
            parent_item_id: "",
            action: null,
            exclude_other_parents: null,
            reason: "",
          },
          "canonical_parent",
        ),
  );
  const inputSchema = useMemo(() => z.object({ edge: EdgeInputSchema }), []);
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema,
    outputSchema: CurationEdgeSchema,
    mutationFn: ({ edge: data }) => {
      const body = edge
        ? {
            parent_item_id: data.parent_item_id,
            action: data.action,
            exclude_other_parents: data.exclude_other_parents,
            reason: data.reason,
          }
        : data;
      return fetch(edge ? `curation/edges/${edge.uuid}/` : "curation/edges/", true, false, {
        method: edge ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      router.refresh();
      onClose();
    },
  });

  const submit = () => mutate({ edge: input });
  const set = <K extends keyof EdgeInput>(field: K, value: EdgeInput[K]) =>
    setInput((current) => ({ ...current, [field]: value }));
  const secondary = input.relation === "secondary_parent";
  const root = input.relation === "canonical_parent" && input.parent_item_id === null;

  return (
    <BasePopup
      title={edge ? "Modifier l'arête" : "Ajouter une arête"}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Enregistrer"
      cancelButtonText="Annuler"
      okButtonDisabled={isPending}
      onOk={submit}
      onCancel={onClose}
      onClose={onClose}
      className="w-full h-full overflow-y-auto max-md:rounded-none md:w-[40rem] md:h-auto md:max-h-[85vh]"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-relation`} className="text-sm font-medium text-gray-700">
            {FIELD_TITLES.relation}
          </label>
          <select
            id={`${id}-relation`}
            value={input.relation}
            disabled={Boolean(edge)}
            onChange={(event) => setInput(reshape(input, event.target.value as EdgeRelation))}
            className="w-full px-3 py-2 border rounded-md"
          >
            {Object.entries(EDGE_RELATIONS).map(([relation, title]) => (
              <option key={relation} value={relation}>
                {title}
              </option>
            ))}
          </select>
        </div>
        {edge ? (
          <p className="text-sm">
            <span className="font-medium text-gray-700">{FIELD_TITLES.item_id} : </span>
            {labels[input.item_id] || input.item_id}
          </p>
        ) : (
          <GenrePicker
            label={FIELD_TITLES.item_id}
            value={input.item_id}
            defaultText={labels[input.item_id] || input.item_id}
            onChange={(value) => set("item_id", value)}
            catalog
          />
        )}
        {input.relation === "canonical_parent" && (
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={root}
              onChange={(event) => set("parent_item_id", event.target.checked ? null : "")}
            />
            Racine acceptée (sans parent)
          </label>
        )}
        {!root && (
          <GenrePicker
            label={FIELD_TITLES.parent_item_id}
            value={input.parent_item_id ?? ""}
            defaultText={labels[input.parent_item_id ?? ""] || input.parent_item_id || ""}
            onChange={(value) => set("parent_item_id", value)}
            catalog
          />
        )}
        {secondary ? (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-action`} className="text-sm font-medium text-gray-700">
              {FIELD_TITLES.action}
            </label>
            <select
              id={`${id}-action`}
              value={input.action ?? "add"}
              onChange={(event) => set("action", event.target.value as "add" | "remove")}
              className="w-full px-3 py-2 border rounded-md"
            >
              {Object.entries(EDGE_ACTIONS).map(([action, title]) => (
                <option key={action} value={action}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={input.exclude_other_parents === true}
              onChange={(event) => set("exclude_other_parents", event.target.checked)}
            />
            {FIELD_TITLES.exclude_other_parents}
          </label>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-reason`} className="text-sm font-medium text-gray-700">
            {FIELD_TITLES.reason}
          </label>
          <textarea
            id={`${id}-reason`}
            value={input.reason}
            onChange={(event) => set("reason", event.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        {formErrors.length > 0 && (
          <div role="alert" className="flex flex-col gap-1 text-red-500">
            {formErrors.map((error, index) => {
              const field = error.field.replace(/^edge\./, "");
              return (
                <p key={index}>
                  {FIELD_TITLES[field] ? `${FIELD_TITLES[field]} : ` : ""}
                  {error.message}
                </p>
              );
            })}
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </BasePopup>
  );
}
