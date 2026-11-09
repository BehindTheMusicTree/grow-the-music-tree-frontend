export type UrlQueryMethod = "push" | "replace";
export type UrlQueryMutation = (params: URLSearchParams) => void;

type PendingWrite = { mutate: UrlQueryMutation; method: UrlQueryMethod; ownerPathname: string };

let pending: PendingWrite[] | null = null;

/**
 * Applies a query-string change to the current URL through the native History API, which Next.js syncs into
 * `useSearchParams` without a server round trip. Each write starts from `window.location`, never from a rendered
 * `useSearchParams` snapshot: a snapshot lags behind writes not yet rendered, so a write based on it (e.g. the
 * viewport reported at the end of the zoom a selection triggers) would silently undo them.
 *
 * `ownerPathname` is the rendered `usePathname()` of the writer. A write whose page has been left by the time the
 * batch runs (e.g. a camera report landing after Next pushed the other view) is dropped, so view-state params never
 * leak onto another page. Reading `window.location` at call time would be too late: it already shows the new page.
 *
 * Writes issued in the same tick are applied as one history entry, pushed if any kept write asked for a push.
 */
export function updateUrlQuery(mutate: UrlQueryMutation, method: UrlQueryMethod, ownerPathname: string): void {
  if (pending) {
    pending.push({ mutate, method, ownerPathname });
    return;
  }
  const batch: PendingWrite[] = [{ mutate, method, ownerPathname }];
  pending = batch;
  queueMicrotask(() => {
    pending = null;
    const url = new URL(window.location.href);
    const writes = batch.filter((write) => write.ownerPathname === url.pathname);
    if (writes.length === 0) return;
    // Compare serialized params, not hrefs: serializing re-encodes characters like "," that the current URL keeps raw.
    const before = url.searchParams.toString();
    writes.forEach((write) => write.mutate(url.searchParams));
    if (url.searchParams.toString() === before) return;
    const target = `${url.pathname}${url.search}${url.hash}`;
    if (writes.some((write) => write.method === "push")) window.history.pushState(null, "", target);
    else window.history.replaceState(null, "", target);
  });
}
