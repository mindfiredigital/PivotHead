import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  h,
  toRaw,
  type PropType,
  type SetupContext,
} from 'vue';
import '@mindfiredigital/pivothead-web-component';
import type {
  PivotHeadEl,
  PivotHeadProps,
  PivotHeadMethods,
  PaginationConfig,
  PivotTableState,
  PivotDataRecord,
  PivotOptions,
  FilterConfig,
  PivotHeadMode,
  ConnectionOptions,
  FileConnectionResult,
} from './types';

type EmitEvents = {
  stateChange: [state: PivotTableState<PivotDataRecord>];
  viewModeChange: [data: { mode: 'raw' | 'processed' }];
  paginationChange: [pagination: PaginationConfig];
};

export const PivotHead = defineComponent({
  name: 'PivotHead',
  props: {
    mode: {
      type: String as PropType<PivotHeadMode>,
      default: 'default',
    },
    class: {
      type: String,
      default: undefined,
    },
    style: {
      type: [Object, String] as PropType<Record<string, string> | string>,
      default: undefined,
    },
    data: {
      type: Array as PropType<PivotDataRecord[]>,
      default: undefined,
    },
    options: {
      type: Object as PropType<PivotOptions>,
      default: undefined,
    },
    filters: {
      type: Array as PropType<FilterConfig[]>,
      default: undefined,
    },
    pagination: {
      type: Object as PropType<Partial<PaginationConfig>>,
      default: undefined,
    },
  },
  emits: {
    stateChange: () => true,
    viewModeChange: () => true,
    paginationChange: () => true,
  },
  setup(
    props: PivotHeadProps,
    { emit, slots, expose }: SetupContext<EmitEvents>
  ) {
    const elRef = ref<PivotHeadEl | null>(null);
    const lastPaginationRef = ref<PaginationConfig | undefined>(undefined);

    // Helper to read latest pagination from the element and emit changes when state changes
    const emitPaginationIfChanged = async (): Promise<void> => {
      const el = elRef.value;
      if (!el) return;
      try {
        const pag = el.getPagination?.();
        if (!pag) return;
        const last = lastPaginationRef.value;
        if (
          !last ||
          last.currentPage !== pag.currentPage ||
          last.pageSize !== pag.pageSize ||
          last.totalPages !== pag.totalPages
        ) {
          lastPaginationRef.value = pag;
          emit('paginationChange', pag);
        }
      } catch {
        // no-op
      }
    };

    // Schedules a microtask to ensure we read pagination after the component finishes updating
    const schedulePaginationSync = (): void => {
      nextTick(() => emitPaginationIfChanged());
    };

    // Bridge Vue props to custom element attributes/properties
    watch(
      () => props.data,
      (newData: PivotDataRecord[] | undefined) => {
        const el = elRef.value;
        if (!el || newData === undefined) return;
        // Deep clone to ensure no Vue reactivity
        el.data = JSON.parse(JSON.stringify(toRaw(newData)));
        schedulePaginationSync();

        // Manually emit state after data change
        setTimeout(() => {
          try {
            const currentState = el.getState?.();
            if (currentState) {
              emit('stateChange', currentState);
            }
          } catch (error) {
            // Ignore "Engine not initialized" errors in test environment
            if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
              return;
            }
            console.warn('Error getting state after data change:', error);
          }
        }, 50);
      },
      { deep: true }
    );

    watch(
      () => props.options,
      (newOptions: PivotOptions | undefined) => {
        const el = elRef.value;
        if (!el || newOptions === undefined) return;
        try {
          // Deep clone to ensure no Vue reactivity
          const clonedOptions = JSON.parse(JSON.stringify(toRaw(newOptions)));
          el.options = clonedOptions;
          schedulePaginationSync();

          // Manually emit state after options change
          setTimeout(() => {
            try {
              const currentState = el.getState?.();
              if (currentState) {
                emit('stateChange', currentState);
              }
            } catch (error) {
              // Ignore "Engine not initialized" errors in test environment
              if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
                return;
              }
              console.warn('Error getting state after options change:', error);
            }
          }, 50);
        } catch (error) {
          console.error(
            'Error setting options in Vue wrapper:',
            error,
            newOptions
          );
        }
      },
      { deep: true }
    );

    watch(
      () => props.filters,
      (newFilters: FilterConfig[] | undefined) => {
        const el = elRef.value;
        if (!el || newFilters === undefined) return;

        if (newFilters.length > 0) {
          // Deep clone to ensure no Vue reactivity
          el.filters = JSON.parse(JSON.stringify(toRaw(newFilters)));
        } else {
          // Clear filters when empty array is passed
          el.filters = [];
        }
        schedulePaginationSync();
      },
      { deep: true }
    );

    watch(
      () => props.pagination,
      (newPagination: Partial<PaginationConfig> | undefined) => {
        const el = elRef.value;
        if (!el || newPagination === undefined) return;
        // Deep clone to ensure no Vue reactivity
        const plainPagination = JSON.parse(
          JSON.stringify(toRaw(newPagination))
        );
        el.pagination = {
          ...(el.pagination || { currentPage: 1, pageSize: 10, totalPages: 1 }),
          ...plainPagination,
        };
        schedulePaginationSync();
      },
      { deep: true }
    );

    // Event listeners
    const setupEventListeners = (): void => {
      const el = elRef.value;
      if (!el) return;

      // Initialize last seen pagination from the element and emit once
      try {
        const current = el.getPagination?.();
        if (current) {
          lastPaginationRef.value = current;
          emit('paginationChange', current);
        }
      } catch {
        // no-op
      }

      const handleState = (e: Event): void => {
        const customEvent = e as CustomEvent<PivotTableState<PivotDataRecord>>;
        emit('stateChange', customEvent.detail);
        schedulePaginationSync();
      };

      const handleViewMode = (e: Event): void => {
        const customEvent = e as CustomEvent<{ mode: 'raw' | 'processed' }>;
        emit('viewModeChange', customEvent.detail);
      };

      const handlePagination = (e: Event): void => {
        const customEvent = e as CustomEvent<PaginationConfig>;
        if (customEvent?.detail) {
          lastPaginationRef.value = customEvent.detail;
        }
        emit('paginationChange', customEvent.detail);
      };

      el.addEventListener('stateChange', handleState);
      el.addEventListener('viewModeChange', handleViewMode);
      el.addEventListener('paginationChange', handlePagination);

      // Store cleanup function
      cleanupListeners = (): void => {
        el.removeEventListener('stateChange', handleState);
        el.removeEventListener('viewModeChange', handleViewMode);
        el.removeEventListener('paginationChange', handlePagination);
      };
    };

    let cleanupListeners: (() => void) | null = null;

    onMounted(() => {
      // CRITICAL: Set data and options BEFORE setting up event listeners
      // This prevents rendering with an uninitialized engine
      const el = elRef.value;
      if (el) {
        // Set initial data if provided - convert to plain objects
        if (props.data !== undefined) {
          el.data = JSON.parse(JSON.stringify(toRaw(props.data)));
        }

        // Set initial options if provided - convert to plain objects
        if (props.options !== undefined) {
          try {
            const clonedOptions = JSON.parse(
              JSON.stringify(toRaw(props.options))
            );
            el.options = clonedOptions;
          } catch (error) {
            console.error(
              'Error setting initial options in Vue wrapper:',
              error,
              props.options
            );
          }
        }

        // Set initial filters if provided and not empty
        if (
          props.filters !== undefined &&
          props.filters !== null &&
          props.filters.length > 0
        ) {
          el.filters = JSON.parse(JSON.stringify(toRaw(props.filters)));
        }

        // Set initial pagination if provided
        if (props.pagination !== undefined) {
          const plainPagination = JSON.parse(
            JSON.stringify(toRaw(props.pagination))
          );
          el.pagination = {
            ...(el.pagination || {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
            }),
            ...plainPagination,
          };
        }
      }

      // NOW set up event listeners after data/options are set and engine is initialized
      nextTick(() => {
        setupEventListeners();

        // Manually trigger state change after initial setup
        const el = elRef.value;
        if (el) {
          setTimeout(() => {
            try {
              const currentState = el.getState?.();
              if (currentState) {
                emit('stateChange', currentState);
              }
            } catch (error) {
              // Ignore "Engine not initialized" errors in test environment
              if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
                return;
              }
              console.warn('Error getting initial state:', error);
            }
          }, 100);
        }
      });
    });

    onBeforeUnmount(() => {
      if (cleanupListeners) {
        cleanupListeners();
      }
    });

    // Computed properties for attributes
    const elementProps = computed(() => {
      const attrs: Record<string, unknown> = {
        class: props.class,
        style: props.style,
        mode: props.mode,
      };

      // Don't set data/options as attributes - only set them as properties to avoid conflicts
      // The properties are set in onMounted and watchers with proper deep cloning

      return attrs;
    });

    // Exposed methods for template refs
    const methods: PivotHeadMethods = {
      // Core state and data methods
      getState: () => elRef.value?.getState?.(),
      getData: () => elRef.value?.getData?.(),
      getProcessedData: () => elRef.value?.getProcessedData?.(),
      getGroupedData: () => elRef.value?.getGroupedData?.(),
      refresh: () => elRef.value?.refresh?.(),

      // Data processing methods
      getFilteredData: () => {
        const el = elRef.value;
        if (!el) return [];
        try {
          const state = el.getState?.();
          return state?.rawData || state?.data || el.getData?.() || [];
        } catch {
          return [];
        }
      },

      getFilteredAndProcessedData: () => {
        const el = elRef.value;
        if (!el) return [];
        try {
          const processed = el.getProcessedData?.() || [];
          return Array.isArray(processed)
            ? (processed as PivotDataRecord[])
            : [];
        } catch {
          return [];
        }
      },

      // Sorting and filtering
      sort: (field: string, direction: 'asc' | 'desc') =>
        elRef.value?.sort?.(field, direction),
      getFilters: () => elRef.value?.getFilters?.(),

      // Configuration methods
      setMeasures: measures => elRef.value?.setMeasures?.(measures),
      setDimensions: dimensions => elRef.value?.setDimensions?.(dimensions),
      setGroupConfig: config => elRef.value?.setGroupConfig?.(config),

      // Formatting methods
      formatValue: (value: unknown, field: string) =>
        elRef.value?.formatValue?.(value, field),
      updateFieldFormatting: (field: string, format) =>
        elRef.value?.updateFieldFormatting?.(field, format),
      getFieldAlignment: (field: string) =>
        elRef.value?.getFieldAlignment?.(field),
      showFormatPopup: () => elRef.value?.showFormatPopup?.(),

      // Drag and drop methods
      swapRows: (from: number, to: number) => elRef.value?.swapRows?.(from, to),
      swapColumns: (from: number, to: number) =>
        elRef.value?.swapColumns?.(from, to),

      // Pagination methods
      getPagination: () => elRef.value?.getPagination?.(),
      previousPage: () => elRef.value?.previousPage?.(),
      nextPage: () => elRef.value?.nextPage?.(),
      setPageSize: (size: number) => elRef.value?.setPageSize?.(size),
      goToPage: (page: number) => elRef.value?.goToPage?.(page),

      // View mode methods
      setViewMode: (mode: 'raw' | 'processed') =>
        elRef.value?.setViewMode?.(mode),
      getViewMode: () => elRef.value?.getViewMode?.(),

      // Export methods
      exportToHTML: (fileName?: string) =>
        elRef.value?.exportToHTML?.(fileName),
      exportToPDF: (fileName?: string) => elRef.value?.exportToPDF?.(fileName),
      exportToExcel: (fileName?: string) =>
        elRef.value?.exportToExcel?.(fileName),
      openPrintDialog: () => elRef.value?.openPrintDialog?.(),

      // ConnectService methods
      connectToLocalCSV: async (
        options?: ConnectionOptions
      ): Promise<FileConnectionResult> => {
        const el = elRef.value;
        if (!el || !el.connectToLocalCSV) {
          return {
            success: false,
            error: 'ConnectService not available on the element',
          };
        }
        return el.connectToLocalCSV(options);
      },

      connectToLocalJSON: async (
        options?: ConnectionOptions
      ): Promise<FileConnectionResult> => {
        const el = elRef.value;
        if (!el || !el.connectToLocalJSON) {
          return {
            success: false,
            error: 'ConnectService not available on the element',
          };
        }
        return el.connectToLocalJSON(options);
      },

      connectToLocalFile: async (
        options?: ConnectionOptions
      ): Promise<FileConnectionResult> => {
        const el = elRef.value;
        if (!el || !el.connectToLocalFile) {
          return {
            success: false,
            error: 'ConnectService not available on the element',
          };
        }
        return el.connectToLocalFile(options);
      },
    };

    expose(methods);

    return () => {
      const children = [];

      // Add slot content for minimal mode (like React wrapper)
      if (props.mode === 'minimal') {
        if (slots.header) {
          children.push(h('div', { slot: 'header' }, slots.header()));
        }
        if (slots.body) {
          children.push(h('div', { slot: 'body' }, slots.body()));
        }
      }

      return h(
        'pivot-head',
        {
          ...elementProps.value,
          ref: el => {
            elRef.value = el as unknown as PivotHeadEl;
          },
        },
        children.length > 0 ? children : undefined
      );
    };
  },
});

export default PivotHead;
