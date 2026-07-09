import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginationMeta } from '../types';
import { getErrorMessage } from '../utils/errors';

interface ListResult<T> {
  data: T[];
  meta?: PaginationMeta;
}

const EMPTY_PARAMS: Record<string, unknown> = {};

export const usePaginatedList = <T>(
  fetcher: (params: Record<string, unknown>) => Promise<ListResult<T>>,
  extraParams: Record<string, unknown> = EMPTY_PARAMS,
) => {
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams;

  const extraParamsKey = JSON.stringify(extraParams);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current({
        page: page + 1,
        limit: pageSize,
        search: search || undefined,
        ...extraParamsRef.current,
      });
      setRows(result.data);
      if (result.meta) setMeta(result.meta);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, extraParamsKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    rows,
    meta,
    loading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    reload,
  };
};
