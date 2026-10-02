import type { CurationEntry, CurationStatus as Status } from "@schemas/api/curation";

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

/** Whether the pipeline hasn't applied this entry's last edit yet; unknown (false) before its first run. */
export function isPendingCurationEntry(entry: CurationEntry, appliedExportOn: string | null) {
  return appliedExportOn !== null && Date.parse(entry.updatedOn ?? entry.createdOn) > Date.parse(appliedExportOn);
}

export default function CurationStatus({ status }: { status: Status }) {
  const { appliedExportOn, pendingCount } = status;
  return (
    <p role="status" className="p-3 text-yellow-900 bg-yellow-50 border border-yellow-500 rounded-md">
      {appliedExportOn ? (
        <>
          Dernier run du pipeline appliqué le{" "}
          <time dateTime={appliedExportOn}>{DATE_FORMAT.format(new Date(appliedExportOn))}</time>.{" "}
        </>
      ) : (
        "Aucun run du pipeline enregistré. "
      )}
      {pendingCount === 0
        ? "Aucune modification en attente."
        : `${pendingCount} modification${pendingCount > 1 ? "s" : ""} en attente, appliquée${pendingCount > 1 ? "s" : ""} au prochain run.`}
    </p>
  );
}
