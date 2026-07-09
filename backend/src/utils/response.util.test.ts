import { describe, expect, it } from 'vitest';
import { buildErrorResponse, buildPaginationMeta } from './response.util.js';

describe('buildPaginationMeta', () => {
  it('calculates pages and navigation flags', () => {
    const meta = buildPaginationMeta(2, 10, 25);

    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('handles empty results', () => {
    const meta = buildPaginationMeta(1, 10, 0);

    expect(meta.totalPages).toBe(1);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPreviousPage).toBe(false);
  });
});

describe('buildErrorResponse', () => {
  it('builds a standardized error payload', () => {
    const response = buildErrorResponse('Invalid input', 'VALIDATION_ERROR', '/api/v1/test', [
      { field: 'email', message: 'Email invalide' },
    ]);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Invalid input');
    expect(response.code).toBe('VALIDATION_ERROR');
    expect(response.path).toBe('/api/v1/test');
    expect(response.errors).toHaveLength(1);
    expect(response.timestamp).toBeDefined();
  });
});
