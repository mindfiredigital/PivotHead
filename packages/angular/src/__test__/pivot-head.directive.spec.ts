import { describe, it, expect, vi } from 'vitest';
import { ElementRef } from '@angular/core';
import { PivotHeadDirective } from '../pivot-head.directive';
import type { PivotHeadEl } from '../types';

// Mock the web component
vi.mock('@mindfiredigital/pivothead-web-component', () => ({}));

describe('PivotHeadDirective', () => {
  it('should create', () => {
    const mockElement = {
      data: [],
      options: {},
      filters: [],
      pagination: { currentPage: 1, pageSize: 10, totalPages: 1 },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getAttribute: vi.fn(),
      setAttribute: vi.fn(),
      getPagination: vi.fn(() => ({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
      })),
      refresh: vi.fn(),
    } as unknown as PivotHeadEl;

    const mockElementRef = new ElementRef(mockElement);
    const directive = new PivotHeadDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });

  it('should have default mode', () => {
    const mockElement = document.createElement(
      'pivot-head'
    ) as unknown as PivotHeadEl;
    const mockElementRef = new ElementRef(mockElement);
    const directive = new PivotHeadDirective(mockElementRef);
    expect(directive.mode).toBe('default');
  });

  it('should provide methods object', () => {
    const mockElement = document.createElement(
      'pivot-head'
    ) as unknown as PivotHeadEl;
    const mockElementRef = new ElementRef(mockElement);
    const directive = new PivotHeadDirective(mockElementRef);
    expect(directive.methods).toBeDefined();
    expect(typeof directive.methods.refresh).toBe('function');
  });
});
