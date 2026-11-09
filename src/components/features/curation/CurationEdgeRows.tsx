"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import GenreRef from "@components/features/curation/GenreRef";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { EDGE_ACTIONS, EDGE_RELATIONS, type CurationEdge } from "@schemas/api/curation";

type Props = {
  edges: CurationEdge[];
  labels: Record<string, string>;
  showQid: boolean;
  appliedExportOn: string | null;
  onEdit: (edge: CurationEdge) => void;
};

const isPending = (edge: CurationEdge, appliedExportOn: string | null) =>
  appliedExportOn !== null && Date.parse(edge.updatedOn ?? edge.createdOn) > Date.parse(appliedExportOn);

function edgeName(edge: CurationEdge, labels: Record<string, string>) {
  const { item_id: item, parent_item_id: parent } = edge.row;
  return `${labels[item] || item} → ${parent ? labels[parent] || parent : "racine"}`;
}

function Genre({ id, labels, showQid }: { id: string | null; labels: Record<string, string>; showQid: boolean }) {
  return id ? <GenreRef id={id} label={labels[id]} showQid={showQid} /> : <span className="text-gray-600">Racine</span>;
}

function Details({ edge }: { edge: CurationEdge }) {
  const { action, exclude_other_parents: exclusive, reason } = edge.row;
  return (
    <>
      {action && <span>{EDGE_ACTIONS[action]}</span>}
      {exclusive && <span>Exclut les autres parents</span>}
      {reason && <span className="text-gray-600">{reason}</span>}
    </>
  );
}

function EdgeActions({
  edge,
  labels,
  pending,
  onEdit,
}: {
  edge: CurationEdge;
  labels: Record<string, string>;
  pending: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const name = edgeName(edge, labels);
  const remove = useValidatedMutation({
    inputSchema: z.null(),
    outputSchema: z.null(),
    mutationFn: () => fetch(`curation/edges/${edge.uuid}/`, true, false, { method: "DELETE" }),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-1">
      {pending && (
        <span
          title="Modifiée depuis le dernier run du pipeline"
          className="self-start px-2 py-0.5 text-xs font-medium text-yellow-900 bg-yellow-100 rounded-full"
        >
          En attente
        </span>
      )}
      <div className="flex gap-2">
        <Button onClick={onEdit} disabled={remove.isPending} aria-label={`Modifier ${name}`}>
          Modifier
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.confirm(`Supprimer ${name} ?`) && remove.mutate(null)}
          disabled={remove.isPending}
          aria-label={`Supprimer ${name}`}
        >
          Supprimer
        </Button>
        <Link
          href={`/admin/curation/history?${new URLSearchParams({ entry: edge.uuid })}`}
          aria-label={`Historique de ${name}`}
          className="self-center text-sm underline"
        >
          Historique
        </Link>
      </div>
      {remove.formErrors.map((error, index) => (
        <p key={index} role="alert" className="text-red-500">
          {error.message}
        </p>
      ))}
    </div>
  );
}

export default function CurationEdgeRows({ edges, labels, showQid, appliedExportOn, onEdit }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr>
              {["Relation", "Genre", "Parent", "Détails"].map((title) => (
                <th key={title} className="p-2 text-sm font-medium text-gray-600">
                  {title}
                </th>
              ))}
              <th className="p-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge) => (
              <tr key={edge.uuid} className="align-top border-t">
                <td className="p-2">{EDGE_RELATIONS[edge.row.relation]}</td>
                <td className="p-2">
                  <Genre id={edge.row.item_id} labels={labels} showQid={showQid} />
                </td>
                <td className="p-2">
                  <Genre id={edge.row.parent_item_id} labels={labels} showQid={showQid} />
                </td>
                <td className="flex flex-col gap-1 p-2">
                  <Details edge={edge} />
                </td>
                <td className="p-2">
                  <EdgeActions
                    edge={edge}
                    labels={labels}
                    pending={isPending(edge, appliedExportOn)}
                    onEdit={() => onEdit(edge)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {edges.map((edge) => (
          <li key={edge.uuid}>
            <article className="flex flex-col gap-3 p-3 border rounded-lg">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-sm text-gray-600">Relation</dt>
                <dd>{EDGE_RELATIONS[edge.row.relation]}</dd>
                <dt className="text-sm text-gray-600">Genre</dt>
                <dd className="break-words">
                  <Genre id={edge.row.item_id} labels={labels} showQid={showQid} />
                </dd>
                <dt className="text-sm text-gray-600">Parent</dt>
                <dd className="break-words">
                  <Genre id={edge.row.parent_item_id} labels={labels} showQid={showQid} />
                </dd>
                <dt className="text-sm text-gray-600">Détails</dt>
                <dd className="flex flex-col break-words">
                  <Details edge={edge} />
                </dd>
              </dl>
              <EdgeActions
                edge={edge}
                labels={labels}
                pending={isPending(edge, appliedExportOn)}
                onEdit={() => onEdit(edge)}
              />
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
