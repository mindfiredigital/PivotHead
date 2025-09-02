import React, { useRef } from 'react';
import { PivotHead, type PivotHeadRef, type PivotHeadProps } from '@mindfiredigital/pivothead-react';

type Props = {
  data: Array<Record<string, unknown>>;
  options: Record<string, unknown>;
};

export default function DefaultMode({ data, options }: Props) {
  const ref = useRef<PivotHeadRef>(null);
  const PivotHeadComponent = PivotHead as unknown as React.ComponentType<PivotHeadProps & React.RefAttributes<PivotHeadRef>>;

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => ref.current?.methods.setViewMode('processed')}>Processed</button>
        <button onClick={() => ref.current?.methods.setViewMode('raw')}>Raw</button>
        <button onClick={() => ref.current?.methods.showFormatPopup?.()}>Format</button>
        <button onClick={() => ref.current?.methods.exportToExcel('pivot-data')}>Export Excel</button>
      </div>
      <PivotHeadComponent
        ref={ref}
        mode="default"
        data={data}
        options={options}
      />
    </div>
  );
}
