import React, { useState } from 'react';
import './FrameworkSwitcher.css';

type Framework = 'react' | 'vue' | 'angular' | 'vanilla';

interface FrameworkInfo {
  id: Framework;
  name: string;
  color: string;
  logo: React.ReactNode;
  installCmd: string;
  description: string;
  code: string;
}

const frameworks: FrameworkInfo[] = [
  {
    id: 'react',
    name: 'React',
    color: '#61DAFB',
    logo: (
      <svg viewBox="0 0 100 100" className="framework-logo-svg">
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="currentColor" strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(120 50 50)" />
      </svg>
    ),
    installCmd: 'npm install @mindfiredigital/pivothead-analytics',
    description: 'Use hooks and refs for seamless React integration with automatic cleanup and re-rendering.',
    code: `import { useEffect, useRef } from 'react';
import { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartService, Chart, registerables } from '@mindfiredigital/pivothead-analytics';

Chart.register(...registerables);

function SalesChart({ data, config }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new PivotEngine(data, config);
    const chartService = new ChartService(engine);

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: chartService.getChartData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Analysis' }
        }
      }
    });

    // Cleanup on unmount
    return () => chartRef.current?.destroy();
  }, [data, config]);

  return <canvas ref={canvasRef} />;
}`,
  },
  {
    id: 'vue',
    name: 'Vue',
    color: '#42B883',
    logo: (
      <svg viewBox="0 0 100 100" className="framework-logo-svg">
        <polygon points="50,10 90,80 70,80 50,45 30,80 10,80" fill="currentColor" />
        <polygon points="50,25 75,75 62,75 50,52 38,75 25,75" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    installCmd: 'npm install @mindfiredigital/pivothead-analytics',
    description: 'Leverage Vue\'s reactivity system with Composition API for dynamic chart updates.',
    code: `<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartService, Chart, registerables } from '@mindfiredigital/pivothead-analytics';

Chart.register(...registerables);

const props = defineProps<{
  data: any[];
  config: any;
}>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

const renderChart = () => {
  if (!chartCanvas.value) return;

  const engine = new PivotEngine(props.data, props.config);
  const chartService = new ChartService(engine);

  // Destroy previous instance
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create chart
  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: chartService.getChartData(),
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Sales Analysis' }
      }
    }
  });
};

onMounted(renderChart);
watch(() => [props.data, props.config], renderChart, { deep: true });
onUnmounted(() => chartInstance?.destroy());
</script>`,
  },
  {
    id: 'angular',
    name: 'Angular',
    color: '#DD0031',
    logo: (
      <svg viewBox="0 0 100 100" className="framework-logo-svg">
        <polygon points="50,5 95,25 88,80 50,98 12,80 5,25" fill="currentColor" />
        <polygon points="50,5 50,98 88,80 95,25" fill="currentColor" opacity="0.8" />
        <polygon points="50,18 25,75 35,75 40,62 60,62 65,75 75,75" fill="white" />
        <polygon points="50,18 50,38 62,62 60,62 50,38" fill="white" opacity="0.8" />
        <rect x="42" y="45" width="16" height="8" fill="white" />
      </svg>
    ),
    installCmd: 'npm install @mindfiredigital/pivothead-analytics',
    description: 'Create Angular components with lifecycle hooks and change detection for enterprise apps.',
    code: `import { Component, Input, ViewChild, ElementRef, OnChanges, OnDestroy } from '@angular/core';
import { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartService, Chart, registerables } from '@mindfiredigital/pivothead-analytics';

Chart.register(...registerables);

@Component({
  selector: 'app-pivot-chart',
  template: '<canvas #chartCanvas></canvas>'
})
export class PivotChartComponent implements OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() config: any = {};
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngOnChanges(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.canvasRef?.nativeElement) return;

    const engine = new PivotEngine(this.data, this.config);
    const chartService = new ChartService(engine);

    // Destroy previous chart
    this.chart?.destroy();

    // Create new chart
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: chartService.getChartData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Analysis' }
        }
      }
    });
  }
}`,
  },
  {
    id: 'vanilla',
    name: 'Vanilla JS',
    color: '#F7DF1E',
    logo: (
      <svg viewBox="0 0 100 100" className="framework-logo-svg">
        <rect x="10" y="10" width="80" height="80" rx="8" fill="currentColor" />
        <text x="30" y="75" fontSize="50" fontWeight="bold" fill="#000">JS</text>
      </svg>
    ),
    installCmd: 'npm install @mindfiredigital/pivothead-analytics',
    description: 'Pure JavaScript integration - no framework required. Works anywhere JavaScript runs.',
    code: `import { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartService, Chart, registerables } from '@mindfiredigital/pivothead-analytics';

// Register Chart.js components (once)
Chart.register(...registerables);

// Your data
const salesData = [
  { region: 'North', product: 'Laptops', revenue: 45000 },
  { region: 'North', product: 'Phones', revenue: 32000 },
  { region: 'South', product: 'Laptops', revenue: 38000 },
  { region: 'South', product: 'Phones', revenue: 41000 },
];

// Pivot configuration
const config = {
  rows: [{ uniqueName: 'region', caption: 'Region' }],
  columns: [{ uniqueName: 'product', caption: 'Product' }],
  measures: [
    { uniqueName: 'revenue', caption: 'Revenue', aggregation: 'sum' }
  ],
};

// Initialize
const engine = new PivotEngine(salesData, config);
const chartService = new ChartService(engine);

// Get canvas and render
const canvas = document.getElementById('myChart');
const chart = new Chart(canvas, {
  type: 'bar',
  data: chartService.getChartData(),
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Sales Analysis' }
    }
  }
});`,
  },
];

export default function FrameworkSwitcher(): React.JSX.Element {
  const [activeFramework, setActiveFramework] = useState<Framework>('react');
  const [copied, setCopied] = useState(false);

  const currentFramework = frameworks.find(f => f.id === activeFramework)!;

  const copyCode = () => {
    navigator.clipboard.writeText(currentFramework.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="framework-switcher">
      {/* Framework Selector */}
      <div className="framework-tabs">
        {frameworks.map(fw => (
          <button
            key={fw.id}
            className={`framework-tab ${activeFramework === fw.id ? 'active' : ''}`}
            onClick={() => setActiveFramework(fw.id)}
            style={{ '--fw-color': fw.color } as React.CSSProperties}
          >
            <div className="framework-tab-logo">{fw.logo}</div>
            <span className="framework-tab-name">{fw.name}</span>
          </button>
        ))}
      </div>

      {/* Framework Content */}
      <div className="framework-content" style={{ '--fw-color': currentFramework.color } as React.CSSProperties}>
        <div className="framework-header">
          <div className="framework-title">
            <div className="framework-logo-large">{currentFramework.logo}</div>
            <div>
              <h3>{currentFramework.name}</h3>
              <p>{currentFramework.description}</p>
            </div>
          </div>
          <div className="framework-install">
            <code>{currentFramework.installCmd}</code>
          </div>
        </div>

        <div className="framework-code-section">
          <div className="code-toolbar">
            <span className="code-label">{currentFramework.name} Implementation</span>
            <button className="copy-button" onClick={copyCode}>
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="framework-code">
            <code>{currentFramework.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
