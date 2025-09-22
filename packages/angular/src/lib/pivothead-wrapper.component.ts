import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

// This import registers the web component for the user automatically.
import '@mindfiredigital/pivothead-web-component';

// Import types for a better developer experience
import type {
  PivotHeadElement,
  PivotOptions,
  PivotDataRecord,
} from '@mindfiredigital/pivothead-web-component';
import type { PivotTableState } from '@mindfiredigital/pivothead';

@Component({
  selector: 'pivot-head-wrapper',
  standalone: true, // This makes it a modern, NgModule-less component
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allows the <pivot-head> tag in the template
  template: `<pivot-head #pivotHead></pivot-head>`,
})
export class PivotHeadWrapperComponent implements OnChanges {
  @ViewChild('pivotHead')
  private pivotHeadRef!: ElementRef<PivotHeadElement>;

  // --- Inputs ---
  @Input() data: PivotDataRecord[] = [];
  @Input() options: PivotOptions = {};
  @Input() mode: 'default' | 'minimal' | 'none' = 'default';

  // --- Outputs ---
  @Output() stateChange = new EventEmitter<PivotTableState<PivotDataRecord>>();

  constructor() {
    // We can set up the event listener here once the element ref is available
    // ngAfterViewInit is safer for this.
  }

  // ngAfterViewInit(): void {
  //   this.pivotHeadRef.nativeElement.addEventListener('stateChange', (event: Event) => {
  //     this.stateChange.emit((event as CustomEvent).detail);
  //   });
  // }

  ngAfterViewInit(): void {
    this.pivotHeadRef.nativeElement.addEventListener(
      'stateChange',
      (event: Event) => {
        const customEvent = event as CustomEvent<
          PivotTableState<PivotDataRecord>
        >;
        this.stateChange.emit(customEvent.detail); // Keep this - it's actually correct
      }
    );
  }

  // Syncs Angular inputs with the web component's properties
  ngOnChanges(changes: SimpleChanges): void {
    const el = this.pivotHeadRef?.nativeElement;
    if (!el) return;

    if (changes['data']) el.data = this.data;
    if (changes['options']) el.options = this.options;
    if (changes['mode']) el.setAttribute('mode', this.mode);
  }

  // --- Public API Methods ---
  // Expose the web component's methods for users to call on the wrapper
  public refresh(): void {
    this.pivotHeadRef?.nativeElement.refresh();
  }
  public sort(field: string, direction: 'asc' | 'desc'): void {
    this.pivotHeadRef?.nativeElement.sort(field, direction);
  }
  public exportToExcel(fileName?: string): void {
    this.pivotHeadRef?.nativeElement.exportToExcel(fileName);
  }
  // ... add any other methods from the web component you want to expose
}
