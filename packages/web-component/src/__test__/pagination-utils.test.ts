import { describe, it, expect, vi } from 'vitest';

// Mock module-level dependencies so we can test pagination utils in isolation
vi.mock('../pivot-head/internal/render', () => ({
  renderSwitch: vi.fn(),
}));
vi.mock('../pivot-head/internal/ui', () => ({
  updatePaginationInfo: vi.fn(),
}));

import {
  updatePaginationForData,
  getPaginatedData,
} from '../pivot-head/internal/pagination';

/** Creates a minimal host-like object sufficient for pure pagination helpers. */
function makeHost(
  overrides: {
    currentPage?: number;
    pageSize?: number;
    totalPages?: number;
  } = {}
) {
  return {
    _pagination: {
      currentPage: overrides.currentPage ?? 1,
      pageSize: overrides.pageSize ?? 10,
      totalPages: overrides.totalPages ?? 1,
    },
    _showRawData: false,
    engine: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('updatePaginationForData', () => {
  it('calculates total pages from data length and page size', () => {
    const host = makeHost({ pageSize: 10 });
    updatePaginationForData(host, new Array(25));
    expect(host._pagination.totalPages).toBe(3);
  });

  it('returns 1 total page for empty data', () => {
    const host = makeHost({ pageSize: 10 });
    updatePaginationForData(host, []);
    expect(host._pagination.totalPages).toBe(1);
  });

  it('returns 1 page when data length exactly equals page size', () => {
    const host = makeHost({ pageSize: 5 });
    updatePaginationForData(host, new Array(5));
    expect(host._pagination.totalPages).toBe(1);
  });

  it('rounds up to the next page for a partial last page', () => {
    const host = makeHost({ pageSize: 10 });
    updatePaginationForData(host, new Array(11));
    expect(host._pagination.totalPages).toBe(2);
  });

  it('clamps currentPage down when data shrinks', () => {
    const host = makeHost({ currentPage: 5, pageSize: 10, totalPages: 10 });
    updatePaginationForData(host, new Array(15)); // 2 pages
    expect(host._pagination.totalPages).toBe(2);
    expect(host._pagination.currentPage).toBe(2);
  });

  it('does not change currentPage when it is within the new bounds', () => {
    const host = makeHost({ currentPage: 2, pageSize: 10 });
    updatePaginationForData(host, new Array(30)); // 3 pages
    expect(host._pagination.currentPage).toBe(2);
    expect(host._pagination.totalPages).toBe(3);
  });

  it('does not let currentPage go below 1 when data empties', () => {
    const host = makeHost({ currentPage: 3, pageSize: 10, totalPages: 5 });
    updatePaginationForData(host, []);
    expect(host._pagination.currentPage).toBeGreaterThanOrEqual(1);
  });
});

describe('getPaginatedData', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

  it('returns the first page slice', () => {
    const host = makeHost({ currentPage: 1, pageSize: 3 });
    expect(getPaginatedData(host, items)).toEqual(['a', 'b', 'c']);
  });

  it('returns the second page slice', () => {
    const host = makeHost({ currentPage: 2, pageSize: 3 });
    expect(getPaginatedData(host, items)).toEqual(['d', 'e', 'f']);
  });

  it('returns a partial last page', () => {
    const host = makeHost({ currentPage: 4, pageSize: 3 });
    // page 4 starts at index 9: items[9]='j', items[10]='k'
    expect(getPaginatedData(host, items)).toEqual(['j', 'k']);
  });

  it('returns empty array when page start is beyond data length', () => {
    const host = makeHost({ currentPage: 10, pageSize: 5 });
    expect(getPaginatedData(host, items)).toEqual([]);
  });

  it('returns all items when page size exceeds data length', () => {
    const host = makeHost({ currentPage: 1, pageSize: 100 });
    expect(getPaginatedData(host, items)).toEqual(items);
  });

  it('works with object arrays', () => {
    const records = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const host = makeHost({ currentPage: 2, pageSize: 2 });
    expect(getPaginatedData(host, records)).toEqual([{ id: 3 }, { id: 4 }]);
  });
});
