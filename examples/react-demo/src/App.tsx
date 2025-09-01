import { useState } from 'react';
import DefaultDemo from './pages/DefaultDemo';
import MinimalDemo from './pages/MinimalDemo';
import './App.css';

function App() {
  const [page, setPage] = useState<'default' | 'minimal'>('default');

  return (
    <div className="app">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setPage(p => (p === 'default' ? 'minimal' : 'default'))}>
          Switch to {page === 'default' ? 'Minimal' : 'Default'}
        </button>
      </div>

      {page === 'default' ? <DefaultDemo /> : <MinimalDemo />}
    </div>
  );
}

export default App;