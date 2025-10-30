// "use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';

// NOTE: This file is a cleaned-up extract of the theme-aware Data Visualization
// section. It mirrors the working parts of the original `dataVisualisation.tsx`
// while ensuring imports and theme handling are correct. After review we can
// either replace the original file or copy the relevant fixes back into it.

type Region = 'north' | 'south' | 'east' | 'west';

interface RegionData {
  sales: string;
  qty: number;
  avg: string;
}

interface Row {
  id?: string;
  product: string;
  north: RegionData;
  south: RegionData;
  east: RegionData;
  west: RegionData;
}

interface FormatSettings {
  chooseValue: string;
  textAlign: string;
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPlaces: string;
  currencySymbol: string;
  currencyAlign: string;
  nullValue: string;
  formatAsPercent: string;
}

interface CellFormat {
  [key: string]: FormatSettings;
}

function applyCustomFormat(
  value: string | number,
  format?: FormatSettings,
  isNumeric = true
) {
  // Minimal formatting stub to keep the example runnable.
  if (!format) return String(value);
  if (value === '$0' || value === 0) return String(value);
  return String(value);
}

const InteractivePivotTable = () => {
  const { colorMode } = useColorMode();
  const [data, setData] = useState<Row[]>([
    {
      id: '1',
      product: 'Widget A',
      north: { sales: '$1M', qty: 50, avg: '$20K' },
      south: { sales: '$0', qty: 0, avg: '$0' },
      east: { sales: '$1.3M', qty: 104, avg: '$5.5K' },
      west: { sales: '$1.3M', qty: 65, avg: '$20K' },
    },
    {
      id: '2',
      product: 'Widget B',
      north: { sales: '$1.8M', qty: 90, avg: '$20K' },
      south: { sales: '$1.5M', qty: 75, avg: '$20K' },
      east: { sales: '$1.6M', qty: 80, avg: '$20K' },
      west: { sales: '$0', qty: 0, avg: '$0' },
    },
    {
      id: '3',
      product: 'Widget C',
      north: { sales: '$1.3M', qty: 70, avg: '$18.5K' },
      south: { sales: '$0', qty: 0, avg: '$0' },
      east: { sales: '$0', qty: 0, avg: '$0' },
      west: { sales: '$0', qty: 0, avg: '$0' },
    },
    {
      id: '4',
      product: 'Widget D',
      north: { sales: '$0', qty: 0, avg: '$0' },
      south: { sales: '$1.1M', qty: 55, avg: '$20K' },
      east: { sales: '$0', qty: 0, avg: '$0' },
      west: { sales: '$300K', qty: 40, avg: '$20K' },
    },
  ]);

  const [regions, setRegions] = useState<Region[]>([
    'north',
    'south',
    'east',
    'west',
  ]);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: string;
    region: Region;
    metric: string;
  } | null>(null);
  const [cellFormats, setCellFormats] = useState<CellFormat>({});

  const [draggedRow, setDraggedRow] = useState<string | null>(null);
  const [draggedRegion, setDraggedRegion] = useState<Region | null>(null);
  const dragOverRow = useRef<string | null>(null);
  const dragOverRegion = useRef<Region | null>(null);

  const handleFormatClick = useCallback(
    (rowId: string, region: Region, metric: string) => {
      const cellKey = `${rowId}-${region}-${metric}`;
      setSelectedCell({ row: rowId, region, metric });
      setShowFormatDialog(true);
    },
    []
  );

  const handleApplyFormat = useCallback(
    (settings: FormatSettings) => {
      if (selectedCell) {
        const cellKey = `${selectedCell.row}-${selectedCell.region}-${selectedCell.metric}`;
        setCellFormats(prev => ({ ...prev, [cellKey]: settings }));
      }
      setShowFormatDialog(false);
    },
    [selectedCell]
  );

  const formatCellValue = useCallback(
    (
      value: string | number,
      rowId: string,
      region: Region,
      metric: string
    ): string => {
      const cellKey = `${rowId}-${region}-${metric}`;
      const format = cellFormats[cellKey];
      return applyCustomFormat(value, format, metric !== 'qty');
    },
    [cellFormats]
  );

  // drag handlers (no-op stubs to keep code intact)
  const handleRowDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRow(rowId);
  };
  const handleRowDragOver = (e: React.DragEvent, rowId: string) => {
    e.preventDefault();
    dragOverRow.current = rowId;
  };
  const handleRowDrop = (e: React.DragEvent, targetRowId: string) => {
    e.preventDefault();
    setDraggedRow(null);
    dragOverRow.current = null;
  };
  const handleColumnDragStart = (e: React.DragEvent, region: Region) => {
    setDraggedRegion(region);
  };
  const handleColumnDragOver = (e: React.DragEvent, region: Region) => {
    e.preventDefault();
    dragOverRegion.current = region;
  };
  const handleColumnDrop = (e: React.DragEvent, targetRegion: Region) => {
    e.preventDefault();
    setDraggedRegion(null);
    dragOverRegion.current = null;
  };

  return (
    <div
      className={clsx(
        'rounded-lg shadow-lg overflow-hidden border transition-colors',
        colorMode === 'dark'
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-slate-200'
      )}
    >
      <div
        className={clsx(
          'flex justify-between items-center p-3 border-b transition-colors',
          colorMode === 'dark'
            ? 'bg-slate-800 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        )}
      >
        <h2
          className={clsx(
            'text-base font-bold',
            colorMode === 'dark' ? 'text-white' : 'text-slate-900'
          )}
        >
          Pivothead Core
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowFormatDialog(true)}
            className={clsx(
              'px-2 py-1 rounded-md text-xs font-medium transition-colors',
              colorMode === 'dark'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            Format
          </button>
          <button className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs font-medium transition-colors">
            Fields
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr
              className={colorMode === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}
            >
              <th
                className={clsx(
                  'px-1 py-1 text-xs text-left font-semibold border-b w-[50px]',
                  colorMode === 'dark'
                    ? 'text-white border-slate-700 bg-slate-800'
                    : 'text-slate-900 border-slate-200 bg-white'
                )}
              >
                Product
              </th>
              {regions.map(region => (
                <th
                  key={region}
                  colSpan={3}
                  draggable
                  onDragStart={e => handleColumnDragStart(e, region)}
                  onDragOver={e => handleColumnDragOver(e, region)}
                  onDrop={e => handleColumnDrop(e, region)}
                  className={clsx(
                    'px-1 py-1 text-xs font-semibold border-b cursor-move transition-colors',
                    colorMode === 'dark'
                      ? 'text-white border-slate-700'
                      : 'text-slate-900 border-slate-200',
                    region === 'north'
                      ? colorMode === 'dark'
                        ? 'bg-blue-950'
                        : 'bg-blue-50'
                      : region === 'south'
                        ? colorMode === 'dark'
                          ? 'bg-amber-950'
                          : 'bg-amber-50'
                        : region === 'east'
                          ? colorMode === 'dark'
                            ? 'bg-green-950'
                            : 'bg-green-50'
                          : colorMode === 'dark'
                            ? 'bg-pink-950'
                            : 'bg-pink-50'
                  )}
                  style={{ minWidth: '40px', maxWidth: '50px' }}
                >
                  {region.charAt(0).toUpperCase().slice(0, 1)}
                </th>
              ))}
            </tr>
            <tr
              className={colorMode === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}
            >
              {regions.map(region => (
                <React.Fragment key={region}>
                  <th
                    className={clsx(
                      'px-1 py-1 text-[10px] font-medium border-b w-[20px]',
                      colorMode === 'dark'
                        ? 'text-slate-300 border-slate-700'
                        : 'text-slate-700 border-slate-200'
                    )}
                  >
                    Sales
                  </th>
                  <th
                    className={clsx(
                      'px-1 py-1 text-[10px] font-medium border-b w-[15px]',
                      colorMode === 'dark'
                        ? 'text-slate-300 border-slate-700'
                        : 'text-slate-700 border-slate-200'
                    )}
                  >
                    Qty
                  </th>
                  <th
                    className={clsx(
                      'px-1 py-1 text-[10px] font-medium border-b w-[15px]',
                      colorMode === 'dark'
                        ? 'text-slate-300 border-slate-700'
                        : 'text-slate-700 border-slate-200'
                    )}
                  >
                    Avg
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr
                key={row.id}
                draggable
                onDragStart={e => handleRowDragStart(e, row.id!)}
                onDragOver={e => handleRowDragOver(e, row.id!)}
                onDrop={e => handleRowDrop(e, row.id!)}
                className={clsx(
                  'cursor-move',
                  colorMode === 'dark'
                    ? 'border-b border-slate-700 hover:bg-slate-800'
                    : 'border-b border-slate-200 hover:bg-slate-50'
                )}
              >
                <td
                  className={clsx(
                    'px-1 py-1 text-xs font-medium sticky left-0 z-10 w-[50px]',
                    colorMode === 'dark'
                      ? 'text-white bg-slate-800'
                      : 'text-slate-900 bg-slate-50'
                  )}
                >
                  {row.product.split(' ').pop()}
                </td>
                {regions.map(region => (
                  <React.Fragment key={region}>
                    <td
                      onClick={() =>
                        handleFormatClick(row.id!, region, 'sales')
                      }
                      style={{
                        textAlign:
                          (cellFormats[
                            `${row.id}-${region}-sales`
                          ]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) ||
                          'right',
                      }}
                      className={clsx(
                        'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                        (row[region].sales.includes('$') ||
                          cellFormats[`${row.id}-${region}-sales`]
                            ?.currencySymbol !== 'Dollar ($)') &&
                          row[region].sales !== '$0'
                          ? colorMode === 'dark'
                            ? 'bg-red-500 text-white font-medium'
                            : 'bg-red-600 text-white font-medium'
                          : colorMode === 'dark'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {formatCellValue(
                        row[region].sales,
                        row.id!,
                        region,
                        'sales'
                      )}
                    </td>
                    <td
                      onClick={() => handleFormatClick(row.id!, region, 'qty')}
                      style={{
                        textAlign:
                          (cellFormats[
                            `${row.id}-${region}-qty`
                          ]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) ||
                          'right',
                      }}
                      className={clsx(
                        'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                        row[region].qty > 0
                          ? colorMode === 'dark'
                            ? 'bg-blue-500 text-white font-medium'
                            : 'bg-blue-600 text-white font-medium'
                          : colorMode === 'dark'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {formatCellValue(row[region].qty, row.id!, region, 'qty')}
                    </td>
                    <td
                      onClick={() => handleFormatClick(row.id!, region, 'avg')}
                      style={{
                        textAlign:
                          (cellFormats[
                            `${row.id}-${region}-avg`
                          ]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) ||
                          'right',
                      }}
                      className={clsx(
                        'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                        (row[region].avg.includes('$') ||
                          cellFormats[`${row.id}-${region}-avg`]
                            ?.currencySymbol !== 'Dollar ($)') &&
                          row[region].avg !== '$0'
                          ? colorMode === 'dark'
                            ? 'bg-red-500 text-white font-medium'
                            : 'bg-red-600 text-white font-medium'
                          : colorMode === 'dark'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {formatCellValue(row[region].avg, row.id!, region, 'avg')}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFormatDialog && (
        // Minimal placeholder for dialog in this extract
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow">
            Format dialog (stub)
          </div>
        </div>
      )}
    </div>
  );
};

const DataProcessingEngine: React.FC = () => (
  <div className="mt-8">
    <div className="flex justify-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg text-slate-700 dark:text-white text-center transition-all duration-300 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20">
        <p className="font-semibold text-lg">Data Processing Engine</p>
        <small className="text-xs text-slate-500 dark:text-slate-400">
          Aggregation • Filtering • Sorting • SetGroup
        </small>
      </div>
    </div>
  </div>
);

const FrontendOptions: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-3 min-w-[200px] min-h-[250px] transition-all duration-300">
    <div className="flex justify-center">
      <div className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-400 dark:from-green-400 dark:to-green-300 rounded-full text-white font-semibold text-sm shadow-md transition-all duration-300">
        Your Frontend
      </div>
    </div>
    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-500 hover:scale-[1.02]">
      React Components
    </div>
    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-500 hover:scale-[1.02]">
      Vue Components
    </div>
    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-500 hover:scale-[1.02]">
      Svelte Components
    </div>
    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-500 hover:scale-[1.02]">
      Vanilla JS
    </div>
  </div>
);

const AnimatedArrow: React.FC<{ delay: number }> = ({ delay }) => (
  <svg
    className="w-full h-8 absolute top-1/2 left-10 transform -translate-y-1/2"
    viewBox="0 0 100 10"
    preserveAspectRatio="none"
  >
    <path
      d="M 0 5 H 90"
      fill="none"
      stroke="var(--ph-accent)"
      strokeWidth="1.5"
      strokeDasharray="100"
      strokeDashoffset="100"
      style={{ animation: `dash-flow 1.5s ease-out ${delay}s forwards` }}
    />
    <polygon points="90,1 100,5 90,9" fill="var(--ph-accent)" />
  </svg>
);

const HeadlessDataVisualizationSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={clsx(
        'py-16 overflow-hidden transition-colors duration-300',
        colorMode === 'dark' ? 'bg-slate-900' : 'bg-white'
      )}
      style={{
        ['--ph-accent' as any]: colorMode === 'dark' ? '#f87171' : '#ef4444',
      }}
    >
      <div className="container">
        <div
          className={clsx(
            'text-center mb-10 transition-all duration-1000',
            isVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform -translate-y-4'
          )}
        >
          <h2 className={clsx('text-3xl sm:text-4xl font-extrabold')}>
            Headless Pivot Tables, Simplified
          </h2>
          <p className={clsx('text-lg')}>
            Where Data Logic Meets Design Freedom
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-start lg:gap-8 gap-12 relative">
          <div
            className={clsx(
              'flex flex-col items-center w-full lg:w-[450px] transition-all duration-1000',
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
            )}
          >
            <div
              className={clsx(
                'p-4 rounded-xl shadow-2xl border transition-all duration-300',
                colorMode === 'dark'
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
              )}
            >
              <div className="px-4 py-1.5 rounded-full text-white font-semibold text-sm -mt-8 shadow-md">
                PivotHead Core
              </div>
              <div className="mt-4 w-full">
                <InteractivePivotTable />
              </div>
              <DataProcessingEngine />
            </div>
          </div>
          <div className="flex flex-col items-center w-full lg:w-[450px]">
            <div
              className={clsx(
                'transition-all duration-1000',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-10'
              )}
            >
              <FrontendOptions />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlessDataVisualizationSection;
