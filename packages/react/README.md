# PivotHead React Wrapper

A thin React wrapper around `@mindfiredigital/pivothead-web-component` that preserves all functionality and supports all modes: `default`, `minimal`, and `none`.

Install (inside the monorepo):

- Add the package in workspace and run `pnpm -w i`
- Build with `pnpm -w build`

Usage:

```tsx
import { PivotHead } from '@mindfiredigital/pivothead-react';

export default function App() {
  return (
    <PivotHead
      mode="default"
      data={data}
      options={options}
      filters={filters}
      pagination={{ pageSize: 10 }}
      onStateChange={e => console.log(e.detail)}
      ref={ref => {
        // You can call methods on the underlying element via ref?.methods
        // e.g., ref?.methods.getState()
      }}
    />
  );
}
```
