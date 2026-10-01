export default function CurationBanner() {
  return (
    <p role="status" className="rounded-md border border-yellow-500 bg-yellow-50 p-3 text-yellow-900">
      Changes apply on the next pipeline run.
    </p>
  );
}
