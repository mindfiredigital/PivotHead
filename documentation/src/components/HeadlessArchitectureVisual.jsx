import React, { useState } from 'react';
import styles from './HeadlessArchitecture.module.css';

const HeadlessArchitectureVisual = () => {
  const [activeLayer, setActiveLayer] = useState(null);

  const layers = {
    ui: {
      title: 'Presentation Layer',
      color: '#3b82f6',
      description: 'Your custom UI components - complete design freedom',
      features: [
        'Any framework (React, Vue, Angular)',
        'Custom styling and themes',
        'Your design system',
        'Interactive components'
      ]
    },
    bridge: {
      title: 'Web Component Bridge',
      color: '#8b5cf6',
      description: 'Standardized interface between UI and engine',
      features: [
        'Framework-agnostic API',
        'Event handling',
        'State synchronization',
        'Browser compatibility'
      ]
    },
    core: {
      title: 'Core Engine',
      color: '#ef4444',
      description: 'Pure logic - the brain of PivotHead',
      features: [
        'Data transformation',
        'Pivot calculations',
        'Aggregations & filters',
        'Performance optimized'
      ]
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2> Headless Architecture Layers</h2>
        <p>Click on each layer to learn more</p>
      </div>

      <div className={styles.architectureDiagram}>
        {/* Your Data */}
        <div className={styles.dataSource}>
          {/* <div className={styles.dataIcon}></div> */}
          <div className={styles.dataLabel}>Your Data</div>
          <div className={styles.dataSubLabel}>JSON, CSV, API</div>
        </div>

        <div className={styles.arrow}>↓</div>

        {/* Core Engine Layer */}
        <div
          className={`${styles.layer} ${styles.coreLayer} ${activeLayer === 'core' ? styles.active : ''}`}
          onClick={() => setActiveLayer(activeLayer === 'core' ? null : 'core')}
          style={{ borderColor: layers.core.color }}
        >
          <div className={styles.layerHeader}>
            {/* <div className={styles.layerIcon}></div> */}
            <div className={styles.layerTitle}>{layers.core.title}</div>
          </div>
          <div className={styles.layerBadge} style={{ backgroundColor: layers.core.color }}>
            @pivothead/core
          </div>
          {activeLayer === 'core' && (
            <div className={styles.layerDetails}>
              <p>{layers.core.description}</p>
              <ul>
                {layers.core.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* <div className={styles.arrow}>↕</div> */}

        {/* Bridge Layer */}
        <div
          className={`${styles.layer} ${styles.bridgeLayer} ${activeLayer === 'bridge' ? styles.active : ''}`}
          onClick={() => setActiveLayer(activeLayer === 'bridge' ? null : 'bridge')}
          style={{ borderColor: layers.bridge.color }}
        >
          <div className={styles.layerHeader}>
            <div className={styles.layerIcon}></div>
            <div className={styles.layerTitle}>{layers.bridge.title}</div>
          </div>
          <div className={styles.layerBadge} style={{ backgroundColor: layers.bridge.color }}>
            @pivothead/webcomponent
          </div>
          {activeLayer === 'bridge' && (
            <div className={styles.layerDetails}>
              <p>{layers.bridge.description}</p>
              <ul>
                {layers.bridge.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.arrow}>↑</div>

        {/* UI Layer */}
        <div
          className={`${styles.layer} ${styles.uiLayer} ${activeLayer === 'ui' ? styles.active : ''}`}
          onClick={() => setActiveLayer(activeLayer === 'ui' ? null : 'ui')}
          style={{ borderColor: layers.ui.color }}
        >
          <div className={styles.layerHeader}>
            {/* <div className={styles.layerIcon}></div> */}
            <div className={styles.layerTitle}>{layers.ui.title}</div>
          </div>
          <div className={styles.frameworkLogos}>
            <span title="React"></span>
            <span title="Vue"></span>
            <span title="Angular"></span>
            <span title="Svelte"></span>
            <span title="Vanilla JS"></span>
          </div>
          {activeLayer === 'ui' && (
            <div className={styles.layerDetails}>
              <p>{layers.ui.description}</p>
              <ul>
                {layers.ui.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.arrow}>↓</div>

        {/* Output */}
        <div className={styles.output}>
          <div className={styles.outputIcon}></div>
          <div className={styles.outputLabel}>Your Custom Pivot Table</div>
        </div>
      </div>

      {/* Comparison */}
      <div className={styles.comparison}>
        <div className={styles.comparisonHeader}>
          <h3>Headless vs Traditional</h3>
        </div>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonCard}>
            <div className={styles.comparisonTitle}>Traditional Libraries</div>
            <ul className={styles.comparisonList}>
              <li>Fixed UI components</li>
              <li>Limited customization</li>
              <li>Framework-specific</li>
              <li>Large bundle size (500KB+)</li>
              <li>Coupled logic and UI</li>
              <li>Breaking changes on updates</li>
            </ul>
          </div>
          <div className={`${styles.comparisonCard} ${styles.comparisonHighlight}`}>
            <div className={styles.comparisonTitle}> PivotHead Headless</div>
            <ul className={styles.comparisonList}>
              <li>Complete design freedom</li>
              <li>100% customizable</li>
              <li>Any framework</li>
              <li>Lightweight</li>
              <li>Separated concerns</li>
              <li>Stable core API</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Flow Example */}
      <div className={styles.dataFlowSection}>
        <h3>Data Flow Example</h3>
        <div className={styles.dataFlowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>1</div>
            <div className={styles.flowContent}>
              <strong>Input Data</strong>
              <code className={styles.codeSnippet}>
{`const data = [
  { product: 'A', region: 'North', sales: 100 },
  { product: 'B', region: 'South', sales: 200 }
];`}
              </code>
            </div>
          </div>
          
          <div className={styles.flowArrow}>→</div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>2</div>
            <div className={styles.flowContent}>
              <strong>Core Engine</strong>
              <code className={styles.codeSnippet}>
{`const engine = new PivotEngine(data, {
  rows: ['product'],
  columns: ['region'],
  values: ['sales']
});`}
              </code>
            </div>
          </div>
          
          <div className={styles.flowArrow}>→</div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>3</div>
            <div className={styles.flowContent}>
              <strong>Your UI</strong>
              <code className={styles.codeSnippet}>
{`<YourCustomTable 
  data={engine.getPivotData()}
  theme="dark"
  interactive
/>`}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className={styles.benefitsSection}>
        <h3>Key Benefits</h3>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}></div>
            <h4>Design Freedom</h4>
            <p>Build exactly the UI your users need. No compromises.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}></div>
            <h4>Performance</h4>
            <p>Lightweight core engine. Only load what you need.</p>
          </div>
          <div className={styles.benefitCard}>
            {/* <div className={styles.benefitIcon}></div> */}
            <h4>Framework Agnostic</h4>
            <p>Works with React, Vue, Angular, or vanilla JavaScript.</p>
          </div>
          <div className={styles.benefitCard}>
            {/* <div className={styles.benefitIcon}></div> */}
            <h4>Easy Testing</h4>
            <p>Test business logic and UI independently.</p>
          </div>
          <div className={styles.benefitCard}>
            {/* <div className={styles.benefitIcon}></div> */}
            <h4>Small Bundle</h4>
            <p>Core engine is ~50KB. Control your bundle size.</p>
          </div>
          <div className={styles.benefitCard}>
            {/* <div className={styles.benefitIcon}></div> */}
            <h4>Future Proof</h4>
            <p>Switch frameworks without rewriting pivot logic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadlessArchitectureVisual;