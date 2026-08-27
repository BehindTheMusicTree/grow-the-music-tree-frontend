export default function PrototypeModeBanner() {
  return (
    <div
      role="status"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-amber-500 px-4 py-1.5 text-center text-sm font-medium text-black"
    >
      You&apos;re viewing the prototype demo tree — browsing only, changes aren&apos;t saved.
    </div>
  );
}
