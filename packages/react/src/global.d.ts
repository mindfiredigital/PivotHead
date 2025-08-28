// Ambient typings for the custom element so TS/JSX accept <pivot-head />

// Allow using <pivot-head /> in TSX files
declare global {
  interface HTMLElementTagNameMap {
    'pivot-head': HTMLElement;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    'pivot-head': Partial<HTMLElement> & { [key: string]: unknown };
  }
}
