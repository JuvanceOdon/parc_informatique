import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePaginatedList } from './usePaginatedList';

describe('usePaginatedList', () => {
  it('does not refetch in a loop when extraParams default is used', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const { rerender } = renderHook(() => usePaginatedList(fetcher));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    rerender();
    rerender();
    rerender();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
