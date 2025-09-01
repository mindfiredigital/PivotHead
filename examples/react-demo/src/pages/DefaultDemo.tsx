import { useEffect, useRef } from 'react';
import '@mindfiredigital/pivothead-web-component';
import PivotHead, { PivotHeadEl } from '../components/PivotHead';
import { demoData, demoOptions } from '../demoConfig';

export default function DefaultDemo() {
  const pivotRef = useRef<PivotHeadEl | null>(null);

  useEffect(() => {
    if (pivotRef.current) {
      pivotRef.current.data = demoData as unknown[];
      pivotRef.current.options = demoOptions as unknown;
    }
  }, []);

  const handleSort = () => pivotRef.current?.sort('Sales', 'desc');
  const handleFilter = () => {
    if (pivotRef.current) {
      pivotRef.current.filters = [{ field: 'Category', operator: 'equals', value: 'Electronics' }] as unknown[];
    }
  };

  return (
    <div>
      <h1>Default UI</h1>
      <div className="controls">
        <button onClick={handleSort}>Sort by Sales (DESC)</button>
        <button onClick={handleFilter}>Filter Electronics</button>
      </div>
      <PivotHead ref={pivotRef} style={{ display: 'block' }} />
    </div>
  );
}
