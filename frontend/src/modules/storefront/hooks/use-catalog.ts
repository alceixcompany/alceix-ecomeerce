"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/components/hooks/use-debounced-value";
import { errorMessage } from "@/lib/http";
import { storeRoutes } from "@/config/store-routes";
import { catalogQuery } from "../utils/catalog-query";
import { listPublicProducts, toStoreProduct } from "../services/storefront-api";
import type { Store } from "../data/stores";
export function useCatalog(store: Store) {
  const params = useSearchParams(),
    { query: request, invalidRange } = catalogQuery(
      new URLSearchParams(params.toString()),
    );
  const search = request.toString(),
    debounced = useDebouncedValue(search);
  const [snapshot, setSnapshot] = useState({
    search:
      store.catalogQuery ??
      catalogQuery(new URLSearchParams()).query.toString(),
    items: store.products,
    total: store.catalogTotal ?? store.products.length,
    page: store.catalogPage ?? 1,
    pageCount: store.catalogPageCount ?? 1,
  });
  const loaded = useRef(snapshot.search);
  const [error, setError] = useState<{ search: string; message: string }>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (invalidRange || (loaded.current === debounced && retry === 0)) return;
    const controller = new AbortController();
    listPublicProducts(
      store.slug,
      new URLSearchParams(debounced),
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        loaded.current = debounced;
        setSnapshot({
          search: debounced,
          items: result.items.map(toStoreProduct),
          total: result.total,
          page: result.page,
          pageCount: result.pageCount,
        });
        setError(undefined);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError({ search: debounced, message: errorMessage(reason) });
      });
    return () => controller.abort();
  }, [store.slug, debounced, invalidRange, retry]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all" || value === "featured") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    window.history.replaceState(
      null,
      "",
      `${storeRoutes.storefront(store.slug)}${next.size ? `?${next}` : ""}`,
    );
  }
  const currentError = error?.search === search ? error.message : undefined;
  const pending = !invalidRange && snapshot.search !== search && !currentError;
  return {
    ...snapshot,
    items: invalidRange || pending || currentError ? [] : snapshot.items,
    pending,
    error: currentError,
    invalidRange,
    params,
    change,
    retry: () => {
      setError(undefined);
      setRetry((value) => value + 1);
    },
    reset: () =>
      window.history.replaceState(null, "", storeRoutes.storefront(store.slug)),
  };
}
