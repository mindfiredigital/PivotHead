import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElementRef } from '@angular/core';
import { PivotHeadComponent } from '../pivot-head.component';

// Mock the web component
vi.mock('@mindfiredigital/pivothead-web-component', () => ({}));

describe('PivotHeadComponent', () => {
  let component: PivotHeadComponent;
  let mockElementRef: ElementRef;

  beforeEach(() => {
    // Create a mock element that has the basic properties we need
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
      getState: vi.fn(() => ({})),
      refresh: vi.fn(),
      exportToExcel: vi.fn(),
    };

    mockElementRef = {
      nativeElement: mockElement,
    } as unknown as ElementRef<HTMLElement>;
    component = new PivotHeadComponent();
    // Manually set the elementRef since we can't use @ViewChild in unit tests
    (component as unknown as { elementRef: ElementRef }).elementRef =
      mockElementRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default mode', () => {
    expect(component.mode).toBe('default');
  });

  it('should provide methods object', () => {
    expect(component.methods).toBeDefined();
    expect(typeof component.methods.refresh).toBe('function');
    expect(typeof component.methods.exportToExcel).toBe('function');
  });

  it('should compute data attribute correctly', () => {
    component.data = [{ test: 'value' }];
    expect(component.dataAttr).toBe('[{"test":"value"}]');
  });

  it('should compute options attribute correctly', () => {
    component.options = { rows: ['field1'] } as any;
    expect(component.optionsAttr).toBe('{"rows":["field1"]}');
  });
});
