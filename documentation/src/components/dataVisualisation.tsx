// "use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';
import FormatDialog from './format-dialogbox'; // Assuming this component exists

// --- Types ---
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

// --- Utility Function (Placeholder) ---
// Minimal formatting stub to keep the example runnable.
// Replace with the full 'applyCustomFormat' if needed.
function applyCustomFormat(
  value: string | number,
  format?: FormatSettings,
  isNumeric = true
) {
  if (!format) return String(value);
  if (value === '$0' || value === 0) return String(value);
  // Add simplified formatting logic or integrate the full function
  // For demonstration, just returning the string value
  return String(value);
}


// --- Interactive Pivot Table Component ---
const InteractivePivotTable = () => {
  const { colorMode } = useColorMode();
  const [data, setData] = useState<Row[]>([
    { id: '1', product: 'Widget A', north: { sales: '$1M', qty: 50, avg: '$20K' }, south: { sales: '$0', qty: 0, avg: '$0' }, east: { sales: '$1.3M', qty: 104, avg: '$5.5K' }, west: { sales: '$1.3M', qty: 65, avg: '$20K' },},
    { id: '2', product: 'Widget B', north: { sales: '$1.8M', qty: 90, avg: '$20K' }, south: { sales: '$1.5M', qty: 75, avg: '$20K' }, east: { sales: '$1.6M', qty: 80, avg: '$20K' }, west: { sales: '$0', qty: 0, avg: '$0' }, },
    { id: '3', product: 'Widget C', north: { sales: '$1.3M', qty: 70, avg: '$18.5K' }, south: { sales: '$0', qty: 0, avg: '$0' }, east: { sales: '$0', qty: 0, avg: '$0' }, west: { sales: '$0', qty: 0, avg: '$0' }, },
    { id: '4', product: 'Widget D', north: { sales: '$0', qty: 0, avg: '$0' }, south: { sales: '$1.1M', qty: 55, avg: '$20K' }, east: { sales: '$0', qty: 0, avg: '$0' }, west: { sales: '$300K', qty: 40, avg: '$20K' }, },
  ]);
  const [regions, setRegions] = useState<Region[]>(['north','south','east','west',]);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: string; region: Region; metric: string; } | null>(null);
  const [cellFormats, setCellFormats] = useState<CellFormat>({});
  const [draggedRow, setDraggedRow] = useState<string | null>(null);
  const [draggedRegion, setDraggedRegion] = useState<Region | null>(null);
  const dragOverRow = useRef<string | null>(null);
  const dragOverRegion = useRef<Region | null>(null);

  const handleFormatClick = useCallback((rowId: string, region: Region, metric: string) => {
      const cellKey = `${rowId}-${region}-${metric}`;
      const initialSettings = cellFormats[cellKey] || { chooseValue: 'None', textAlign: 'Right', thousandSeparator: ',', decimalSeparator: '.', decimalPlaces: '0', currencySymbol: 'Dollar ($)', currencyAlign: 'Left', nullValue: 'None', formatAsPercent: 'No' }; // Use default or existing
      setSelectedCell({ row: rowId, region, metric });
      setShowFormatDialog(true);
      // Pass initialSettings to FormatDialog if it accepts them
    }, [cellFormats]); // Depend on cellFormats

  const handleApplyFormat = useCallback((settings: FormatSettings) => {
      if (selectedCell) {
        const cellKey = `${selectedCell.row}-${selectedCell.region}-${selectedCell.metric}`;
        setCellFormats(prev => ({ ...prev, [cellKey]: settings }));
      }
      setShowFormatDialog(false);
    }, [selectedCell]);

  const formatCellValue = useCallback((value: string | number, rowId: string, region: Region, metric: string): string => {
      const cellKey = `${rowId}-${region}-${metric}`;
      const format = cellFormats[cellKey];
      // *** Use the actual applyCustomFormat function here ***
      return applyCustomFormat(value, format, metric !== 'qty');
    }, [cellFormats]);

  // --- Drag and Drop Handlers ---
  const handleRowDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRow(rowId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleRowDragOver = (e: React.DragEvent, rowId: string) => {
    e.preventDefault();
    dragOverRow.current = rowId;
    e.dataTransfer.dropEffect = 'move';
  };
  const handleRowDrop = (e: React.DragEvent, targetRowId: string) => {
    e.preventDefault();
    if (!draggedRow || draggedRow === targetRowId) return;
    const draggedIndex = data.findIndex(r => r.id === draggedRow);
    const targetIndex = data.findIndex(r => r.id === targetRowId);
    const newData = [...data];
    const [draggedItem] = newData.splice(draggedIndex, 1);
    newData.splice(targetIndex, 0, draggedItem);
    setData(newData);
    setDraggedRow(null);
    dragOverRow.current = null;
  };

  const handleColumnDragStart = (e: React.DragEvent, region: Region) => {
    setDraggedRegion(region);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleColumnDragOver = (e: React.DragEvent, region: Region) => {
    e.preventDefault();
    dragOverRegion.current = region;
    e.dataTransfer.dropEffect = 'move';
  };
  const handleColumnDrop = (e: React.DragEvent, targetRegion: Region) => {
    e.preventDefault();
    if (!draggedRegion || draggedRegion === targetRegion) return;
    const draggedIndex = regions.indexOf(draggedRegion);
    const targetIndex = regions.indexOf(targetRegion);
    const newRegions = [...regions];
    const [draggedItem] = newRegions.splice(draggedIndex, 1);
    newRegions.splice(targetIndex, 0, draggedItem);
    setRegions(newRegions);
    setDraggedRegion(null);
    dragOverRegion.current = null;
  };

  return (
    <>
      <div
        className={clsx(
          'rounded-lg shadow-lg overflow-hidden border transition-colors',
          colorMode === 'dark'
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-slate-200' // Corrected closing bracket
        )}
      >
        {/* Header */}
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
              onClick={() => setShowFormatDialog(true)} // Keep simple for now
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className={clsx("transition-colors", colorMode === 'dark' ? 'bg-slate-800' : 'bg-slate-100')}>
                <th className={clsx("px-1 py-1 text-xs text-left font-semibold border-b w-[50px] sticky left-0 z-10 transition-colors", colorMode === 'dark' ? 'text-white border-slate-700 bg-slate-800' : 'text-slate-900 border-slate-200 bg-white')}>
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
                      colorMode === 'dark' ? 'text-white border-slate-700' : 'text-slate-900 border-slate-200',
                      region === 'north' ? (colorMode === 'dark' ? 'bg-blue-950' : 'bg-blue-50')
                      : region === 'south' ? (colorMode === 'dark' ? 'bg-amber-950' : 'bg-amber-50')
                      : region === 'east' ? (colorMode === 'dark' ? 'bg-green-950' : 'bg-green-50')
                      : (colorMode === 'dark' ? 'bg-pink-950' : 'bg-pink-50')
                    )}
                    style={{ minWidth: '40px', maxWidth: '50px' }}
                  >
                    {region.charAt(0).toUpperCase().slice(0, 1)}
                  </th>
                ))}
              </tr>
              <tr className={clsx("transition-colors", colorMode === 'dark' ? 'bg-slate-800' : 'bg-slate-50')}>
                {regions.map(region => (
                  <React.Fragment key={region}>
                    <th className={clsx("px-1 py-1 text-[10px] font-medium border-b w-[20px] transition-colors", colorMode === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200')}>Sales</th>
                    <th className={clsx("px-1 py-1 text-[10px] font-medium border-b w-[15px] transition-colors", colorMode === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200')}>Qty</th>
                    <th className={clsx("px-1 py-1 text-[10px] font-medium border-b w-[15px] transition-colors", colorMode === 'dark' ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200')}>Avg</th>
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
                  className={clsx('cursor-move transition-colors', colorMode === 'dark' ? 'border-b border-slate-700 hover:bg-slate-800' : 'border-b border-slate-200 hover:bg-slate-50')}
                >
                  <td className={clsx('px-1 py-1 text-xs font-medium sticky left-0 z-10 w-[50px] transition-colors', colorMode === 'dark' ? 'text-white bg-slate-800' : 'text-slate-900 bg-slate-50')}>
                    {row.product.split(' ').pop()}
                  </td>
                  {regions.map(region => (
                    <React.Fragment key={region}>
                      <td
                        onClick={() => handleFormatClick(row.id!, region, 'sales')}
                        style={{ textAlign: (cellFormats[`${row.id}-${region}-sales`]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) || 'right' }}
                        className={clsx(
                          'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                           (row[region].sales.includes('$') || cellFormats[`${row.id}-${region}-sales`]?.currencySymbol !== 'Dollar ($)') && row[region].sales !== '$0'
                             ? (colorMode === 'dark' ? 'bg-red-500 text-white font-medium' : 'bg-red-600 text-white font-medium')
                             : (colorMode === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                        )}
                      >
                        {formatCellValue(row[region].sales, row.id!, region, 'sales')}
                      </td>
                       <td
                        onClick={() => handleFormatClick(row.id!, region, 'qty')}
                        style={{ textAlign: (cellFormats[`${row.id}-${region}-qty`]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) || 'right' }}
                        className={clsx(
                          'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                           row[region].qty > 0
                             ? (colorMode === 'dark' ? 'bg-blue-500 text-white font-medium' : 'bg-blue-600 text-white font-medium')
                             : (colorMode === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                        )}
                      >
                        {formatCellValue(row[region].qty, row.id!, region, 'qty')}
                      </td>
                       <td
                        onClick={() => handleFormatClick(row.id!, region, 'avg')}
                        style={{ textAlign: (cellFormats[`${row.id}-${region}-avg`]?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) || 'right' }}
                        className={clsx(
                          'px-1 py-1 text-[10px] text-center cursor-pointer hover:opacity-80 transition-opacity',
                           (row[region].avg.includes('$') || cellFormats[`${row.id}-${region}-avg`]?.currencySymbol !== 'Dollar ($)') && row[region].avg !== '$0'
                             ? (colorMode === 'dark' ? 'bg-red-500 text-white font-medium' : 'bg-red-600 text-white font-medium')
                             : (colorMode === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
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
      </div>

      {/* Format Dialog - Assuming FormatDialog component handles its own theming */}
      {showFormatDialog && (
        <FormatDialog
          isOpen={showFormatDialog}
          onClose={() => setShowFormatDialog(false)}
          onApply={handleApplyFormat}
          selectedCell={selectedCell} // Pass selected cell info
          // initialSettings={cellFormats[`${selectedCell?.row}-${selectedCell?.region}-${selectedCell?.metric}`]} // Pass initial settings if supported
        />
      )}
    </>
  );
};

// --- Architectural Wrapper Components ---
const DataProcessingEngine: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <div className="mt-8">
      <div className="flex justify-center">
        <div className={clsx("p-4 rounded-lg shadow-lg text-center transition-all duration-300 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20", colorMode === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700')}>
          <p className="font-semibold text-lg">Data Processing Engine</p>
          <small className={clsx("text-xs", colorMode === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Aggregation • Filtering • Sorting • SetGroup
          </small>
        </div>
      </div>
    </div>
  );
};

const FrontendOptions: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const { colorMode } = useColorMode();
  return (
    // Added relative positioning for potential absolute positioned animations inside
    <div className={clsx("relative rounded-xl shadow-2xl overflow-hidden border p-6 flex flex-col gap-3 min-w-[200px] min-h-[250px] transition-all duration-300", colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
      <div className="flex justify-center">
        <div className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-400 dark:from-green-400 dark:to-green-300 rounded-full text-white font-semibold text-sm shadow-md transition-all duration-300">
           Frontend
        </div>
      </div>
      {/* Apply animation and theme classes to each framework div */}
      <div className={clsx(
          "text-center p-3 border rounded-lg font-medium transition-all duration-500 hover:scale-[1.02]",
          colorMode === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700',
          isVisible ? 'animate-bounce-slow' : 'opacity-0' // Added entrance animation trigger
        )}>React Components</div>
      <div className={clsx(
          "text-center p-3 border rounded-lg font-medium transition-all duration-500 hover:scale-[1.02]",
          colorMode === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700',
           isVisible ? 'animate-bounce-slow delay-300' : 'opacity-0' // Added entrance animation trigger + delay
        )}>Vue Components</div>
      <div className={clsx(
          "text-center p-3 border rounded-lg font-medium transition-all duration-500 hover:scale-[1.02]",
          colorMode === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700',
          isVisible ? 'animate-bounce-slow delay-500' : 'opacity-0' // Added entrance animation trigger + delay
        )}>Angular Components</div>
      <div className={clsx(
          "text-center p-3 border rounded-lg font-medium transition-all duration-500 hover:scale-[1.02]",
          colorMode === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700',
          isVisible ? 'animate-bounce-slow delay-700' : 'opacity-0' // Added entrance animation trigger + delay
        )}>JavaScript</div>
       {/* Ensure animation styles are defined (globally or here) */}
       <style>{`
          @keyframes bounce-slow {
             0%, 20%, 50%, 80%, 100% {
               transform: translateY(0);
               box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2);
             }
             40% {
               transform: translateY(-5px);
               box-shadow: 0 5px 15px 0 rgba(16, 185, 129, 0.4);
             }
             60% { transform: translateY(-2px); }
           }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-700 { animation-delay: 0.7s; }
        `}</style>
    </div>
  );
};

// --- Animated Arrow Component ---
const AnimatedArrow: React.FC<{ delay: number }> = ({ delay }) => {
  const { colorMode } = useColorMode();
  const arrowColor = colorMode === 'dark' ? '#f87171' : '#ef4444';

  return (
    <svg
      className="w-full h-8 absolute top-1/2 left-10 transform -translate-y-1/2"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
    >
      <path
        d="M 0 5 H 90"
        fill="none"
        stroke={arrowColor}
        strokeWidth="1.5"
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{
          animation: `dash-flow 1.5s ease-out ${delay}s forwards, glow-pulse 3s ease-in-out infinite ${delay + 1.5}s`,
        }}
      />
      <polygon
        points="90,1 100,5 90,9"
        fill={arrowColor}
        opacity="0"
        style={{
          animation: `fade-in 0.5s ease-out ${delay + 1}s forwards, arrow-pulse 3s ease-in-out infinite ${delay + 1.5}s`,
        }}
      />
    </svg>
  );
};


// --- Main Section Component ---
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

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const accentColor = colorMode === 'dark' ? '#f87171' : '#ef4444';

  return (
     <>
      {/* Global Animation Styles */}
      <style>{`
          @keyframes dash-flow { to { stroke-dashoffset: 0; } }
          @keyframes fade-in { to { opacity: 1; } }
          @keyframes glow-pulse {
             0%, 100% { filter: drop-shadow(0 0 2px ${accentColor}80); opacity: 1; }
             50% { filter: drop-shadow(0 0 5px ${accentColor}); opacity: 1; }
           }
          @keyframes arrow-pulse {
             0%, 100% { transform: scale(1); }
             50% { transform: scale(1.1); }
           }
      `}</style>
      <section
        ref={sectionRef}
        className={clsx(
          'py-16 overflow-hidden transition-colors duration-300',
          colorMode === 'dark' ? 'bg-black' : 'bg-white' // Updated dark background
        )}
        style={{ ['--ph-accent' as any]: accentColor }}
      >
        <div className="container">
          {/* Section Header with Entrance Animation */}
          <div
            className={clsx(
              'text-center mb-10 transition-all duration-1000 ease-out',
              isVisible
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform -translate-y-4'
            )}
          >
            <h2 className={clsx('text-3xl sm:text-4xl font-extrabold transition-colors', colorMode === 'dark' ? 'text-white' : 'text-slate-900')}>
              Headless Pivot Tables, Simplified
            </h2>
            <p className={clsx('text-lg mt-2 transition-colors', colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
              Where Data Logic Meets Design Freedom
            </p>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row justify-center items-start lg:gap-8 gap-12 relative">
            {/* Left Panel: Core Engine + Table */}
            <div
              className={clsx(
                'flex flex-col items-center w-full lg:w-[450px] transition-all duration-1000 ease-out',
                isVisible ? 'opacity-100 transform translate-x-0 delay-200' : 'opacity-0 transform -translate-x-10'
              )}
            >
              <div className={clsx("p-4 rounded-xl shadow-2xl border transition-all duration-300 hover:shadow-red-500/30", colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
                 <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-full text-white font-semibold text-sm -mt-8 shadow-md transition-all duration-300 mx-auto w-fit">
                   PivotHead Core
                 </div>
                <div className="mt-4 w-full">
                  <InteractivePivotTable />
                </div>
                <DataProcessingEngine />
              </div>
            </div>

            {/* Center: Animated Arrows */}
             <div className="hidden lg:flex flex-col justify-center items-center w-[120px] h-[360px] relative mt-20">
               <div className="w-full h-full relative">
                 <div className="absolute top-[25%] left-0 w-full">
                   <AnimatedArrow delay={0.8} />
                 </div>
                 <div className="absolute top-[55%] left-0 w-full">
                   <AnimatedArrow delay={1.2} />
                 </div>
               </div>
            </div>

            {/* Right Panel: Frontend Options */}
            <div className="flex flex-col items-center w-full lg:w-[450px]">
              <div
                className={clsx(
                  'transition-all duration-1000 ease-out',
                  isVisible ? 'opacity-100 transform translate-x-0 delay-400' : 'opacity-0 transform translate-x-10'
                )}
              >
                {/* Pass isVisible to FrontendOptions */}
                <FrontendOptions isVisible={isVisible} />
              </div>
            </div>
          </div>

           {/* Why Go Headless Section */}
           <div
            className={clsx(
              'text-center mt-20 transition-opacity duration-1000 ease-out',
              isVisible ? 'opacity-100 delay-500' : 'opacity-0'
            )}
          >
            <h2 className={clsx("text-3xl font-extrabold mb-3 transition-colors", colorMode === 'dark' ? 'text-white' : 'text-slate-900')}>
              Why Go Headless?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              {/* Cards remain the same */}
              <div className={clsx("p-6 rounded-xl border shadow-md transition-transform duration-500 hover:scale-[1.03]", colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                <h3 className={clsx("text-xl font-semibold mb-3 transition-colors", colorMode === 'dark' ? 'text-white' : 'text-slate-900')}>Framework Agnostic</h3>
                <p className={clsx("transition-colors", colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600')}>Integrate with any JavaScript framework. Your data visualization is reusable and decoupled.</p>
              </div>
              <div className={clsx("p-6 rounded-xl border shadow-md transition-transform duration-500 hover:scale-[1.03]", colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                <h3 className={clsx("text-xl font-semibold mb-3 transition-colors", colorMode === 'dark' ? 'text-white' : 'text-slate-900')}>Enhanced Performance</h3>
                <p className={clsx("transition-colors", colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600')}>By separating logic from presentation, we optimize data processing for faster, smoother interactions.</p>
              </div>
              <div className={clsx("p-6 rounded-xl border shadow-md transition-transform duration-500 hover:scale-[1.03]", colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                <h3 className={clsx("text-xl font-semibold mb-3 transition-colors", colorMode === 'dark' ? 'text-white' : 'text-slate-900')}>Future-Proof Your Stack</h3>
                <p className={clsx("transition-colors", colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600')}>Easily migrate or adopt new frontend technologies without having to rebuild your core data logic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeadlessDataVisualizationSection;