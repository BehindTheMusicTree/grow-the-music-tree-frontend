"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-gray-800">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
