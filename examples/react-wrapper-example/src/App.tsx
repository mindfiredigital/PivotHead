import React from 'react';
import { demoData, baseOptions } from './sharedConfig';
import DefaultMode from './components/DefaultMode';
import MinimalMode from './components/MinimalMode';
import NoneMode from './components/NoneMode';

export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>PivotHead React Wrapper Example</h1>
      <p>Demonstrates all three modes with a shared config.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Default Mode</h2>
        <DefaultMode data={demoData} options={baseOptions} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Minimal Mode</h2>
        <MinimalMode data={demoData} options={baseOptions} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>None Mode</h2>
        <NoneMode data={demoData} options={baseOptions} />
      </section>
    </div>
  );
}
