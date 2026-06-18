import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal data-fetching hook: { data, loading, error, reload }. Ignores stale
 *  responses (last-write-wins) so overlapping reloads don't clobber newer data. */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const seq = useRef(0);

  // deps are intentionally the caller's dependency list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    const my = ++seq.current;
    setLoading(true);
    return fn()
      .then((d) => {
        if (my === seq.current) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (my === seq.current) setError(e);
      })
      .finally(() => {
        if (my === seq.current) setLoading(false);
      });
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run };
}
