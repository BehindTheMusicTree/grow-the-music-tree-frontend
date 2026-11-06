export type UrlQueryMethod = "push" | "replace";
export type UrlQueryMutation = (params: URLSearchParams) => void;

let pending: { mutations: UrlQueryMutation[]; method: UrlQueryMethod } | null = null;

/**
 * Applies a query-string change to the current URL through the native History API, which Next.js syncs into
 * `useSearchParams` without a server round trip. Each write starts from `window.location`, never from a rendered
 * `useSearchParams` snapshot: a snapshot lags behind writes not yet rendered, so a write based on it (e.g. the
 * viewport reported at the end of the zoom a selection triggers) would silently undo them.
 *
 * Writes issued in the same tick are applied as one history entry, pushed if any of them asked for a push.
 */
export function updateUrlQuery(mutate: UrlQueryMutation, method: UrlQueryMethod): void {
  if (pending) {
    pending.mutations.push(mutate);
    if (method === "push") pending.method = "push";
    return;
  }
  const batch = { mutations: [mutate], method };
  pending = batch;
  queueMicrotask(() => {
    pending = null;
    const url = new URL(window.location.href);
    batch.mutations.forEach((m) => m(url.searchParams));
    if (url.href === window.location.href) return;
    const target = `${url.pathname}${url.search}${url.hash}`;
    if (batch.method === "push") window.history.pushState(null, "", target);
    else window.history.replaceState(null, "", target);
  });
}
