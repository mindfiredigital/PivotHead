// "use client"

// import React from "react"
// import { useState, useEffect, useRef } from "react"
// import clsx from "clsx"

// function HeadlessDataVisualizationSection() {
//   const [isVisible, setIsVisible] = useState(false)
//   const [colorMode, setColorMode] = useState("light")
//   const sectionRef = useRef(null)

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true)
//         }
//       },
//       { threshold: 0.1 },
//     )

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current)
//     }

//     const checkTheme = () => {
//       const isDark =
//         document.documentElement.getAttribute("data-theme") === "dark" ||
//         document.documentElement.classList.contains("dark") ||
//         window.matchMedia("(prefers-color-scheme: dark)").matches
//       setColorMode(isDark ? "dark" : "light")
//     }

//     checkTheme()
//     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
//     mediaQuery.addEventListener("change", checkTheme)

//     return () => {
//       observer.disconnect()
//       mediaQuery.removeEventListener("change", checkTheme)
//     }
//   }, [])

//   type Region = "north" | "south" | "east" | "west";

// interface RegionData {
//   sales: string;
//   qty: number;
//   avg: string;
// }

// interface Row {
//   product: string;
//   north: RegionData;
//   south: RegionData;
//   east: RegionData;
//   west: RegionData;
// }

//   const PivotTable: React.FC = () => {
//   const data: Row[] = [
//     {
//       product: "Widget A",
//       north: { sales: "$1,000,000", qty: 50, avg: "$20,000" },
//       south: { sales: "$0", qty: 0, avg: "$0" },
//       east: { sales: "$1,300,000", qty: 104, avg: "$5,562" },
//       west: { sales: "$1,300,000", qty: 65, avg: "$20,000" },
//     },
//     {
//       product: "Widget B",
//       north: { sales: "$1,800,000", qty: 90, avg: "$20,000" },
//       south: { sales: "$1,500,000", qty: 75, avg: "$20,000" },
//       east: { sales: "$1,600,000", qty: 80, avg: "$20,000" },
//       west: { sales: "$0", qty: 0, avg: "$0" },
//     },
//     {
//       product: "Widget C",
//       north: { sales: "$1,300,000", qty: 70, avg: "$18,571" },
//       south: { sales: "$0", qty: 0, avg: "$0" },
//       east: { sales: "$0", qty: 0, avg: "$0" },
//       west: { sales: "$0", qty: 0, avg: "$0" },
//     },
//     {
//       product: "Widget D",
//       north: { sales: "$0", qty: 0, avg: "$0" },
//       south: { sales: "$1,100,000", qty: 55, avg: "$20,000" },
//       east: { sales: "$0", qty: 0, avg: "$0" },
//       west: { sales: "$300,000", qty: 40, avg: "$20,000" },
//     },
//   ];

//   const regions: Region[] = ["north", "south", "east", "west"];

//   return (
//     <div className="pivot-table-container">
//       <div className="pivot-table-header">
//         <h3 className="pivot-title">Pivothead Core</h3>
//         <div className="pivot-controls">
//           <button className="control-btn format-btn">Format</button>
//           <button className="control-btn fields-btn">Fields</button>
//         </div>
//       </div>
//       <div className="pivot-table">
//         <table>
//           <thead>
//             <tr>
//               <th rowSpan={2} className="product-header">Product</th>
//               {regions.map((region) => (
//                 <th key={region} colSpan={3} className={`region-header ${region}-header`}>
//                   {region.charAt(0).toUpperCase() + region.slice(1)}
//                 </th>
//               ))}
//             </tr>
//             <tr>
//               {regions.map((region) => (
//                 <React.Fragment key={region}>
//                   <th className="metric-header">Total Sales</th>
//                   <th className="metric-header">Total Quantity</th>
//                   <th className="metric-header">Average Sale</th>
//                 </React.Fragment>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, index) => (
//               <tr key={index}>
//                 <td className="product-cell">{row.product}</td>
//                 {regions.map((region) => (
//                   <React.Fragment key={region}>
//                     <td className={`data-cell sales-cell ${row[region].sales !== "$0" ? "has-value" : "no-value"}`}>
//                       {row[region].sales}
//                     </td>
//                     <td className={`data-cell qty-cell ${row[region].qty > 0 ? "has-value" : "no-value"}`}>
//                       {row[region].qty}
//                     </td>
//                     <td className={`data-cell avg-cell ${row[region].avg !== "$0" ? "has-value" : "no-value"}`}>
//                       {row[region].avg}
//                     </td>
//                   </React.Fragment>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

//   const DataFlowArrow = ({ delay = 0 }) => (
//     <div className="flow-arrow" style={{ animationDelay: `${delay}s` }}>
//       <div className="arrow-line"></div>
//       <div className="arrow-head"></div>
//     </div>
//   )

//   return (
//     <>
//       <style>{`
//         .headless-section {
//           padding: 5rem 0;
//           background: #f8fafc;
//           position: relative;
//           overflow: hidden;
//         }

//         .headless-section::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
//                       radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
//           pointer-events: none;
//         }

//         [data-theme="dark"] .headless-section {
//           background: #000000;
//         }

//         .section-header {
//           text-align: center;
//           margin-bottom: 4rem;
//           position: relative;
//           z-index: 1;
//         }

//         .section-title {
//           font-size: 3rem;
//           font-weight: 900;
//           margin-bottom: 1rem;
//           background: linear-gradient(160deg, #dc2626 0%, #000000 0%, #dc2626 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           letter-spacing: -0.02em;
          
//         }

//         [data-theme="dark"] .section-title {
//          background: linear-gradient(135deg, #ef4444 0%, #444444 0%, #ef4444 100%);

//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
          
//         }

        

//         .section-description {
//           font-size: 1.375rem;
//           color: #475569;
//           max-width: 48rem;
//           margin: 0 auto;
//           line-height: 1.7;
//           font-weight: 500;
//         }

//         [data-theme="dark"] .section-description {
//           color: #cbd5e1;
//         }

//         .architecture-diagram {
//           max-width: 1200px;
//           margin: 0 auto;
//           display: grid;
//           grid-template-columns: 1fr auto 1fr;
//           gap: 6rem;
//           align-items: center;
//           padding: 2rem;
//           opacity: 0;
//           transform: translateY(40px);
//           transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
//           position: relative;
//           z-index: 1;
//         }

//         .architecture-diagram.visible {
//           opacity: 1;
//           transform: translateY(0);
//         }

//         /* Enhanced Engine Section */
//         .engine-section {
//           background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
//           border: 2px solid #e2e8f0;
//           border-radius: 2rem;
//           padding: 3rem 2.5rem;
//           position: relative;
//           min-height: 400px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 
//                       0 8px 16px rgba(0, 0, 0, 0.04);
//           transition: all 0.4s ease;
//         }

//         .engine-section:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12), 
//                       0 12px 24px rgba(0, 0, 0, 0.08);
//         }

//         [data-theme="dark"] .engine-section {
//           background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
//           border-color: #475569;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
//                       0 8px 16px rgba(0, 0, 0, 0.2);
//         }

//         .engine-label {
//           position: absolute;
//           top: -1rem;
//           left: 50%;
//           transform: translateX(-50%);
//           background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
//           color: white;
//           padding: 0.75rem 2rem;
//           border-radius: 2rem;
//           font-weight: 700;
//           font-size: 0.875rem;
//           box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
//           letter-spacing: 0.025em;
//         }

//         .engine-content {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           height: 100%;
//           gap: 3rem;
//         }

//         /* Added pivot table styles */
//         .pivot-table-container {
//           width: 100%;
//           max-width: 600px;
//           background: #f8fafc;
//           border-radius: 1rem;
//           overflow: hidden;
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
//           animation: tableFloat 3s ease-in-out infinite;
//         }

//         .pivot-table-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1rem 1.5rem;
//           background: #ffffff;
//           border-bottom: 1px solid #e2e8f0;
//         }

//         .pivot-title {
//           font-size: 1.25rem;
//           font-weight: 700;
//           color: #1e293b;
//           margin: 0;
//         }

//         .pivot-controls {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .control-btn {
//           padding: 0.5rem 1rem;
//           border: 1px solid #d1d5db;
//           border-radius: 0.5rem;
//           background: #ffffff;
//           color: #374151;
//           font-size: 0.875rem;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }

//         .format-btn {
//           background: #3b82f6;
//           color: white;
//           border-color: #3b82f6;
//         }

//         .fields-btn {
//           background: #6b7280;
//           color: white;
//           border-color: #6b7280;
//         }

//         .pivot-table {
//           overflow-x: auto;
//           max-height: 300px;
//           overflow-y: auto;
//         }

//         .pivot-table table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 0.75rem;
//         }

//         .pivot-table th,
//         .pivot-table td {
//           padding: 0.5rem 0.25rem;
//           text-align: center;
//           border: 1px solid #e5e7eb;
//         }

//         .product-header,
//         .product-cell {
//           background: #f3f4f6;
//           font-weight: 600;
//           text-align: left;
//           padding-left: 0.75rem;
//         }

//         .region-header {
//           background: #e5e7eb;
//           font-weight: 600;
//           font-size: 0.8rem;
//         }

//         .north-header { background: #dbeafe; }
//         .south-header { background: #fef3c7; }
//         .east-header { background: #d1fae5; }
//         .west-header { background: #fce7f3; }

//         .metric-header {
//           background: #f9fafb;
//           font-weight: 500;
//           font-size: 0.7rem;
//         }

//         .data-cell {
//           font-weight: 500;
//         }

//         .data-cell.has-value {
//           background: #3b82f6;
//           color: white;
//         }

//         .data-cell.no-value {
//           background: #f3f4f6;
//           color: #6b7280;
//         }

//         .sales-cell.has-value {
//           background: #3b82f6;
//         }

//         .qty-cell.has-value {
//           background: #3b82f6;
//         }

//         .avg-cell.has-value {
//           background: #ef4444;
//         }

//         @keyframes tableFloat {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-8px); }
//         }

//         .core-engine {
//           background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
//           color: white;
//           padding: 2rem 1.5rem;
//           border-radius: 1.5rem;
//           text-align: center;
//           font-weight: 700;
//           box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4),
//                       inset 0 1px 0 rgba(255, 255, 255, 0.1);
//           animation: enginePulse 3s ease-in-out infinite;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           font-size: 1.125rem;
//         }

//         .core-engine small {
//           display: block;
//           margin-top: 0.5rem;
//           font-size: 0.875rem;
//           opacity: 0.8;
//           font-weight: 500;
//         }

//         @keyframes enginePulse {
//           0%, 100% { transform: scale(1); box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4); }
//           50% { transform: scale(1.02); box-shadow: 0 16px 40px rgba(30, 41, 59, 0.5); }
//         }

//         /* Enhanced Flow Section */
//         .flow-section {
//           display: flex;
//           flex-direction: column;
//           gap: 1.5rem;
//           align-items: center;
//         }

//         .flow-arrow {
//           position: relative;
//           width: 80px;
//           height: 24px;
//           animation: flowPulse 2.5s ease-in-out infinite;
//         }

//         .arrow-line {
//           position: absolute;
//           top: 50%;
//           left: 0;
//           width: 60px;
//           height: 3px;
//           background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ef4444 100%);
//           transform: translateY(-50%);
//           border-radius: 2px;
//           box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
//         }

//         .arrow-head {
//           position: absolute;
//           top: 50%;
//           right: 0;
//           width: 0;
//           height: 0;
//           border-left: 16px solid #ef4444;
//           border-top: 10px solid transparent;
//           border-bottom: 10px solid transparent;
//           transform: translateY(-50%);
//           filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
//         }

//         @keyframes flowPulse {
//           0%, 100% { opacity: 0.7; transform: translateX(0px) scale(1); }
//           50% { opacity: 1; transform: translateX(8px) scale(1.05); }
//         }

//         /* Enhanced Frontend Section */
//         .frontend-section {
//           background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
//           border: 2px solid #e2e8f0;
//           border-radius: 2rem;
//           padding: 4rem 2.5rem 2.5rem;
//           position: relative;
//           min-height: 400px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 
//                       0 8px 16px rgba(0, 0, 0, 0.04);
//           transition: all 0.4s ease;
//         }

//         .frontend-section:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12), 
//                       0 12px 24px rgba(0, 0, 0, 0.08);
//         }

//         [data-theme="dark"] .frontend-section {
//           background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
//           border-color: #475569;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
//                       0 8px 16px rgba(0, 0, 0, 0.2);
//         }

//         .frontend-label {
//           position: absolute;
//           top: -1rem;
//           left: 50%;
          
//           transform: translateX(-50%);
//           background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//           color: white;
//           padding: 0.75rem 2rem;
//           border-radius: 2rem;
//           font-weight: 700;
//           font-size: 0.875rem;
//           box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
//           letter-spacing: 0.025em;
//         }

//         .frontend-options {
//           display: flex;
//           flex-direction: column;
//           gap: 1.25rem;
//           height: 100%;
//           justify-content: center;
//         }

//         .frontend-option {
//           background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
//           border: 2px solid #e2e8f0;
//           border-radius: 1.25rem;
//           padding: 1.25rem 1.5rem;
//           text-align: center;
//           font-weight: 600;
//           color: #1e293b;
//           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//           animation: optionGlow 4s ease-in-out infinite;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//           font-size: 1rem;
//         }

//         [data-theme="dark"] .frontend-option {
//           background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
//           border-color: #6b7280;
//           color: #f9fafb;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
//         }

//         .frontend-option:nth-child(1) { animation-delay: 0s; }
//         .frontend-option:nth-child(2) { animation-delay: 0.8s; }
//         .frontend-option:nth-child(3) { animation-delay: 1.6s; }
//         .frontend-option:nth-child(4) { animation-delay: 2.4s; }

//         @keyframes optionGlow {
//           0%, 80%, 100% { 
//             border-color: #e2e8f0;
//             background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
//             transform: scale(1);
//             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//           }
//           10%, 30% { 
//             border-color: #10b981;
//             background: linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%);
//             transform: scale(1.03);
//             box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
//           }
//         }

//         [data-theme="dark"] .frontend-option {
//           animation: optionGlowDark 4s ease-in-out infinite;
//         }

//         @keyframes optionGlowDark {
//           0%, 80%, 100% { 
//             border-color: #6b7280;
//             background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
//             transform: scale(1);
//             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
//           }
//           10%, 30% { 
//             border-color: #10b981;
//             background: linear-gradient(145deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
//             transform: scale(1.03);
//             box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
//           }
//         }

//         /* Enhanced Benefits Section */
//         .benefits-section {
//           margin-top: 5rem;
//           text-align: center;
//           position: relative;
//           z-index: 1;
//         }

//         .benefits-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//           gap: 2.5rem;
//           max-width: 1000px;
//           margin: 3rem auto 0;
//         }

//         .benefit-card {
//           background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
//           padding: 2.5rem 2rem;
//           border-radius: 1.5rem;
//           border: 1px solid #e2e8f0;
//           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
//           position: relative;
//           overflow: hidden;
//         }

//         .benefit-card::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           height: 4px;
//           background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }

//         .benefit-card:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
//         }

//         .benefit-card:hover::before {
//           opacity: 1;
//         }

//         [data-theme="dark"] .benefit-card {
//           background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
//           border-color: #475569;
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
//         }

//         .benefit-title {
//           font-size: 1.25rem;
//           font-weight: 800;
//           margin-bottom: 1rem;
//           color: #1e293b;
//           letter-spacing: -0.01em;
//         }

//         [data-theme="dark"] .benefit-title {
//           color: #f1f5f9;
//         }

//         .benefit-description {
//           color: #64748b;
//           line-height: 1.7;
//           font-size: 0.9375rem;
//           font-weight: 500;
//         }

//         [data-theme="dark"] .benefit-description {
//           color: #cbd5e1;
//         }

//         /* Enhanced Responsive */
//         @media (max-width: 996px) {
//             .architecture-diagram {
//                 gap: 3rem;
//             }
//         }
        
//         @media (max-width: 768px) {
//           .headless-section {
//             padding: 4rem 1rem;
//           }
//           .architecture-diagram {
//             grid-template-columns: 1fr;
//             gap: 4rem;
//             padding: 1rem 0;
//           }

//           .flow-section {
//             transform: rotate(90deg) scale(0.9);
//             margin: 2rem 0;
//           }

//           .section-header {
//             margin-bottom: 3rem;
//           }
          
//           .section-title {
//             font-size: 2.25rem;
//           }
          
//           .section-description {
//             font-size: 1.125rem;
//           }

//           .engine-section,
//           .frontend-section {
//             padding: 3rem 1.5rem;
//             min-height: auto;
//           }

//           .pivot-table-container {
//             max-width: 100%;
//           }

//           .pivot-table {
//             font-size: 0.7rem;
//           }

//           .benefits-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         @media (max-width: 480px) {
//             .headless-section {
//                 padding: 3rem 1rem;
//             }
//             .section-title {
//                 font-size: 2rem;
//                 line-height: 1.2;
//             }
//             .section-description {
//                 font-size: 1rem;
//             }
//             .pivot-table-header {
//                 flex-direction: column;
//                 gap: 0.75rem;
//                 align-items: flex-start;
//             }
//             .pivot-controls {
//                 width: 100%;
//                 justify-content: flex-start;
//             }
//             .frontend-options {
//                 gap: 1rem;
//             }
//             .frontend-option {
//                 padding: 1rem;
//                 font-size: 0.9rem;
//             }
//             .benefit-card {
//                 padding: 2rem 1.5rem;
//             }
//         }
//       `}</style>

//       <div className="headless-section" ref={sectionRef}>
//         <div className="container">
//           <div className="section-header">
//             <h2 className="section-title"> Headless Pivot Tables, Simplified
//             </h2>
//             <p className="section-description">Where Data Logic Meets Design Freedom</p>
//           </div>

//           <div className={`architecture-diagram ${isVisible ? "visible" : ""}`}>
//             {/* Left Side - PivotHead Engine */}
//             <div className="engine-section">
//               <div className="engine-label">PivotHead Core</div>
//               <div className="engine-content">
//                 <PivotTable />
//                 <div className="core-engine">
//                   Data Processing Engine
//                   <br />
//                   <small>Aggregation • Filtering • Sorting</small>
//                 </div>
//               </div>
//             </div>

//             {/* Center - Flow Arrows */}
//             <div className="flow-section">
//               <DataFlowArrow delay={0} />
//               <DataFlowArrow delay={0.5} />
//             </div>

//             {/* Right Side - Frontend Options */}
//             <div className="frontend-section">
//               <div className="frontend-label">Your Frontend</div>
//               <div className="frontend-options">
//                 <div className="frontend-option">React Tables</div>
//                 <div className="frontend-option">Vue Components</div>
//                 <div className="frontend-option">Angular Grids</div>
//                 <div className="frontend-option">Custom HTML</div>
//               </div>
//             </div>
//           </div>

//           <div className="benefits-section">
//             <div className="benefits-grid">
//               <div className="benefit-card">
//                 <h3 className="benefit-title">Pure Logic</h3>
//                 <p className="benefit-description">
//                   Get powerful pivot table calculations without any UI constraints or predetermined styling.
//                 </p>
//               </div>

//               <div className="benefit-card">
//                 <h3 className="benefit-title">Any Framework</h3>
//                 <p className="benefit-description">
//                   Works with React, Vue, Angular, or vanilla JavaScript. One engine, infinite possibilities.
//                 </p>
//               </div>

//               <div className="benefit-card">
//                 <h3 className="benefit-title">Your Design</h3>
//                 <p className="benefit-description">
//                   Build tables that perfectly match your brand and user experience requirements.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default HeadlessDataVisualizationSection


"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import clsx from "clsx"

function HeadlessDataVisualizationSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [colorMode, setColorMode] = useState("light")
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    const checkTheme = () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      setColorMode(isDark ? "dark" : "light")
    }

    checkTheme()
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", checkTheme)

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      mediaQuery.removeEventListener("change", checkTheme)
    }
  }, [])

  type Region = "north" | "south" | "east" | "west";

interface RegionData {
  sales: string;
  qty: number;
  avg: string;
}

interface Row {
  product: string;
  north: RegionData;
  south: RegionData;
  east: RegionData;
  west: RegionData;
}

  const PivotTable: React.FC = () => {
  const data: Row[] = [
    {
      product: "Widget A",
      north: { sales: "$1M", qty: 50, avg: "$20K" },
      south: { sales: "$0", qty: 0, avg: "$0" },
      east: { sales: "$1.3M", qty: 104, avg: "$5.5K" },
      west: { sales: "$1.3M", qty: 65, avg: "$20K" },
    },
    {
      product: "Widget B",
      north: { sales: "$1.8M", qty: 90, avg: "$20K" },
      south: { sales: "$1.5M", qty: 75, avg: "$20K" },
      east: { sales: "$1.6M", qty: 80, avg: "$20K" },
      west: { sales: "$0", qty: 0, avg: "$0" },
    }
  ];

  const regions: Region[] = ["north", "south", "east", "west"];

  return (
    <div className="pivot-table-container">
      <div className="pivot-table-header">
        <h3 className="pivot-title">Pivothead Core</h3>
        <div className="pivot-controls">
          <button className="control-btn format-btn">Format</button>
          <button className="control-btn fields-btn">Fields</button>
        </div>
      </div>
      
      {/* Desktop/Tablet Table */}
      <div className="desktop-table">
        <div className="pivot-table-wrapper">
          <table className="pivot-table-desktop">
            <thead>
              <tr>
                <th rowSpan={2} className="product-header">Product</th>
                {regions.map((region) => (
                  <th key={region} colSpan={3} className={`region-header ${region}-header`}>
                    {region.charAt(0).toUpperCase() + region.slice(1)}
                  </th>
                ))}
              </tr>
              <tr>
                {regions.map((region) => (
                  <React.Fragment key={region}>
                    <th className="metric-header">Sales</th>
                    <th className="metric-header">Qty</th>
                    <th className="metric-header">Avg</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="product-cell">{row.product}</td>
                  {regions.map((region) => (
                    <React.Fragment key={region}>
                      <td className={`data-cell sales-cell ${row[region].sales !== "$0" ? "has-value" : "no-value"}`}>
                        {row[region].sales}
                      </td>
                      <td className={`data-cell qty-cell ${row[region].qty > 0 ? "has-value" : "no-value"}`}>
                        {row[region].qty}
                      </td>
                      <td className={`data-cell avg-cell ${row[region].avg !== "$0" ? "has-value" : "no-value"}`}>
                        {row[region].avg}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="mobile-table">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="mobile-product-card">
            <div className="mobile-product-header">
              <h4>{row.product}</h4>
            </div>
            <div className="mobile-regions-grid">
              {regions.map((region) => (
                <div key={region} className={`mobile-region-card ${region}-card`}>
                  <div className="mobile-region-title">
                    {region.charAt(0).toUpperCase() + region.slice(1)}
                  </div>
                  <div className="mobile-metrics">
                    <div className={`mobile-metric ${row[region].sales !== "$0" ? "has-value" : "no-value"}`}>
                      <span className="metric-label">Sales:</span>
                      <span className="metric-value">{row[region].sales}</span>
                    </div>
                    <div className={`mobile-metric ${row[region].qty > 0 ? "has-value" : "no-value"}`}>
                      <span className="metric-label">Qty:</span>
                      <span className="metric-value">{row[region].qty}</span>
                    </div>
                    <div className={`mobile-metric ${row[region].avg !== "$0" ? "has-value" : "no-value"}`}>
                      <span className="metric-label">Avg:</span>
                      <span className="metric-value">{row[region].avg}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

  const DataFlowArrow = ({ delay = 0 }) => (
    <div className="flow-arrow" style={{ animationDelay: `${delay}s` }}>
      <div className="arrow-line"></div>
      <div className="arrow-head"></div>
    </div>
  )

  return (
    <>
      <style>{`
        .headless-section {
          padding: 3rem 0;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }

        .headless-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        [data-theme="dark"] .headless-section {
          background: #050505;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
          padding: 0 1rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(160deg, #dc2626 0%, #000000 0%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        [data-theme="dark"] .section-title {
         background: linear-gradient(135deg, #ef4444 0%, #f1f5f9 50%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-description {
          font-size: 1.125rem;
          color: #475569;
          max-width: 48rem;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 500;
        }

        [data-theme="dark"] .section-description {
          color: #94a3b8;
        }

        .architecture-diagram {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
          padding: 1rem;
          opacity: 0;
          transform: translateY(40px);
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .architecture-diagram.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .engine-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          padding: 3.5rem 1.5rem 2rem;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          transition: all 0.4s ease;
        }
        
        [data-theme="dark"] .engine-section {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .engine-label {
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
          letter-spacing: 0.025em;
          white-space: nowrap;
        }

        .engine-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          width: 100%;
          height: 100%;
        }
        
        .pivot-table-container {
            width: 100%;
            max-width: 100%;
            background: #ffffff;
            border-radius: 1rem;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
            animation: tableFloat 3s ease-in-out infinite;
        }

        [data-theme="dark"] .pivot-table-container {
            background: #0f172a;
            border-color: #334155;
        }

        .pivot-table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        [data-theme="dark"] .pivot-table-header {
            background: #1e293b;
            border-bottom-color: #334155;
        }

        .pivot-title {
            font-size: 1rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }

        [data-theme="dark"] .pivot-title {
            color: #f1f5f9;
        }

        .pivot-controls {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0;
        }

        .control-btn {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            background: #ffffff;
            color: #374151;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        [data-theme="dark"] .control-btn {
            background-color: #334155;
            border-color: #475569;
            color: #cbd5e1;
        }

        .format-btn {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }

        .fields-btn {
            background: #6b7280;
            color: white;
            border-color: #6b7280;
        }
        
        [data-theme="dark"] .format-btn,
        [data-theme="dark"] .fields-btn {
            color: white;
        }

        .desktop-table { display: block; }
        .pivot-table-wrapper { overflow-x: auto; }
        .pivot-table-desktop {
            width: 100%;
            min-width: 600px;
            border-collapse: collapse;
            font-size: 0.75rem;
        }
        .pivot-table-desktop th, .pivot-table-desktop td {
            padding: 0.5rem 0.25rem;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        
        [data-theme="dark"] .pivot-table-desktop th, 
        [data-theme="dark"] .pivot-table-desktop td {
            border-color: #334155;
        }

        .product-header, .product-cell {
            background: #f3f4f6;
            font-weight: 600;
            text-align: left;
            padding-left: 0.75rem;
            position: sticky;
            left: 0;
            z-index: 2;
        }

        [data-theme="dark"] .product-header, 
        [data-theme="dark"] .product-cell {
            background-color: #334155;
        }

        .region-header { background: #e5e7eb; font-weight: 600; }
        [data-theme="dark"] .region-header { background-color: #475569; }

        .north-header { background: #dbeafe; }
        .south-header { background: #fef3c7; }
        .east-header { background: #d1fae5; }
        .west-header { background: #fce7f3; }
        
        [data-theme="dark"] .north-header { background-color: rgba(59, 130, 246, 0.2); }
        [data-theme="dark"] .south-header { background-color: rgba(245, 158, 11, 0.2); }
        [data-theme="dark"] .east-header { background-color: rgba(16, 185, 129, 0.2); }
        [data-theme="dark"] .west-header { background-color: rgba(236, 72, 153, 0.2); }
        
        .metric-header { background: #f9fafb; font-weight: 500; }
        [data-theme="dark"] .metric-header { background-color: #1e293b; }

        .data-cell { font-weight: 500; }
        .data-cell.has-value { background: #3b82f6; color: white; }
        .data-cell.no-value { background: #f3f4f6; color: #6b7280; }
        
        [data-theme="dark"] .data-cell.no-value {
            background: #374151;
            color: #9ca3af;
        }

        .avg-cell.has-value { background: #ef4444; }

        .mobile-table { display: none; }

        @keyframes tableFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .core-engine {
          background: #1e293b;
          color: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          text-align: center;
          font-weight: 700;
          box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: enginePulse 3s ease-in-out infinite;
          border: 1px solid #334155;
          font-size: 1rem;
          max-width: 300px;
          width: 100%;
        }

        .core-engine small {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.8;
          font-weight: 500;
        }

        @keyframes enginePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 16px 40px rgba(30, 41, 59, 0.5); }
        }

        .flow-section {
          display: none;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }

        .flow-arrow {
          position: relative;
          width: 80px;
          height: 24px;
          animation: flowPulse 2.5s ease-in-out infinite;
        }
        
        .arrow-line {
          position: absolute; top: 50%; left: 0;
          width: 60px; height: 3px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ef4444 100%);
          transform: translateY(-50%);
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .arrow-head {
          position: absolute; top: 50%; right: 0;
          width: 0; height: 0;
          border-left: 16px solid #ef4444;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          transform: translateY(-50%);
          filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
        }

        @keyframes flowPulse {
          0%, 100% { opacity: 0.7; transform: translateX(0px) scale(1); }
          50% { opacity: 1; transform: translateX(8px) scale(1.05); }
        }

        .frontend-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          padding: 3.5rem 1.5rem 2rem;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          transition: all 0.4s ease;
        }

        [data-theme="dark"] .frontend-section {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .frontend-label {
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
          letter-spacing: 0.025em;
          white-space: nowrap;
        }

        .frontend-options {
          display: flex; flex-direction: column;
          gap: 1rem; height: 100%;
          justify-content: center;
        }

        .frontend-option {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: optionGlow 4s ease-in-out infinite;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-size: 0.875rem;
        }
        
        [data-theme="dark"] .frontend-option {
          background: #334155;
          border-color: #475569;
          color: #f1f5f9;
        }

        .frontend-option:nth-child(1) { animation-delay: 0s; }
        .frontend-option:nth-child(2) { animation-delay: 0.8s; }
        .frontend-option:nth-child(3) { animation-delay: 1.6s; }
        .frontend-option:nth-child(4) { animation-delay: 2.4s; }

        @keyframes optionGlow {
          0%, 80%, 100% { border-color: #e2e8f0; transform: scale(1); }
          10%, 30% { border-color: #10b981; transform: scale(1.03); }
        }
        
        [data-theme="dark"] @keyframes optionGlow {
          0%, 80%, 100% { border-color: #475569; }
          10%, 30% { border-color: #10b981; }
        }

        .benefits-section { margin-top: 3rem; text-align: center; position: relative; z-index: 1; padding: 0 1rem; }
        .benefits-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 1000px; margin: 2rem auto 0; }
        
        .benefit-card {
            background: #ffffff;
            padding: 2rem 1.5rem;
            border-radius: 1.5rem;
            border: 1px solid #e2e8f0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            position: relative;
            overflow: hidden;
        }
        
        .benefit-card::before {
            content: ''; position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
            opacity: 0; transition: opacity 0.3s ease;
        }
        
        .benefit-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12); }
        .benefit-card:hover::before { opacity: 1; }
        
        [data-theme="dark"] .benefit-card {
            background: #1e293b;
            border-color: #334155;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        
        .benefit-title { font-size: 1.125rem; font-weight: 800; margin-bottom: 1rem; color: #1e293b; }
        [data-theme="dark"] .benefit-title { color: #f1f5f9; }
        
        .benefit-description { color: #64748b; line-height: 1.7; font-size: 0.9375rem; font-weight: 500; }
        [data-theme="dark"] .benefit-description { color: #94a3b8; }
        
        @media (min-width: 768px) {
            .section-title { font-size: 2.5rem; }
            .architecture-diagram { grid-template-columns: 1fr auto 1fr; }
            .flow-section { display: flex; }
            .benefits-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 767px) {
            .desktop-table { display: none; }
            .mobile-table { display: flex; padding: 1rem; gap: 1rem; flex-direction: column; }
            .mobile-product-card { background: white; border-radius: 0.75rem; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
            [data-theme="dark"] .mobile-product-card { background: #1e293b; border-color: #374151; }
            .mobile-product-header { margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; }
            [data-theme="dark"] .mobile-product-header { border-bottom-color: #374151; }
            .mobile-product-header h4 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
            [data-theme="dark"] .mobile-product-header h4 { color: #f1f5f9; }
            .mobile-regions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
            .mobile-region-card { background: #f8fafc; border-radius: 0.5rem; padding: 0.75rem; border: 1px solid #e5e7eb; }
            [data-theme="dark"] .mobile-region-card { background: #374151; border-color: #4b5563; }
            .mobile-region-card.north-card { border-left: 3px solid #3b82f6; }
            .mobile-region-card.south-card { border-left: 3px solid #f59e0b; }
            .mobile-region-card.east-card { border-left: 3px solid #10b981; }
            .mobile-region-card.west-card { border-left: 3px solid #ec4899; }
            .mobile-region-title { font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem; text-transform: uppercase; }
            [data-theme="dark"] .mobile-region-title { color: #9ca3af; }
            .mobile-metrics { display: flex; flex-direction: column; gap: 0.25rem; }
            .mobile-metric { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; }
            .metric-label { color: #6b7280; font-weight: 500; }
            [data-theme="dark"] .metric-label { color: #9ca3af; }
            .metric-value { font-weight: 600; color: #1e293b; }
            [data-theme="dark"] .metric-value { color: #f1f5f9; }
            .mobile-metric.has-value .metric-value { color: #3b82f6; }
            .mobile-metric.no-value .metric-value { color: #9ca3af; }

            .architecture-diagram { grid-template-columns: 1fr; gap: 2rem; }
            .flow-section { display: flex; transform: rotate(90deg); margin: 1rem 0; }
        }

        @media (min-width: 1024px) {
            .benefits-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
      <section className="headless-section" ref={sectionRef} data-theme={colorMode}>
        <div className="section-header">
          <h2 className="section-title">Headless Pivot Tables, Simplified</h2>
          <p className="section-description">
            Where Data Logic Meets Design Freedom
          </p>
        </div>

        <div className={clsx("architecture-diagram", { visible: isVisible })}>
          <div className="engine-section">
            <div className="engine-label">PivotHead Core</div>
            <div className="engine-content">
              <PivotTable />
              <div className="core-engine">
                Data Processing Engine
                <br />
                <small>Aggregation • Filtering • Sorting</small>
              </div>
            </div>
          </div>

          <div className="flow-section">
            <DataFlowArrow />
            <DataFlowArrow delay={0.5} />
          </div>

          <div className="frontend-section">
            <div className="frontend-label">Your Frontend</div>
            <div className="frontend-options">
              <div className="frontend-option">React Components</div>
              <div className="frontend-option">Vue Components</div>
              <div className="frontend-option">Svelte Components</div>
              <div className="frontend-option">Vanilla JS</div>
            </div>
          </div>
        </div>

        <div className="benefits-section">
            <h3 className="section-title">Why Go Headless?</h3>
            <div className="benefits-grid">
                <div className="benefit-card">
                    <h4 className="benefit-title">Framework Agnostic</h4>
                    <p className="benefit-description">
                        Integrate with any JavaScript framework or library. Your visualization layer is decoupled and reusable.
                    </p>
                </div>
                <div className="benefit-card">
                    <h4 className="benefit-title">Enhanced Performance</h4>
                    <p className="benefit-description">
                        By separating logic from presentation, we optimize data processing for faster, smoother interactions.
                    </p>
                </div>
                <div className="benefit-card">
                    <h4 className="benefit-title">Future-Proof Your Stack</h4>
                    <p className="benefit-description">
                        Easily migrate or adopt new frontend technologies without having to rebuild your data visualizations.
                    </p>
                </div>
            </div>
        </div>

      </section>
    </>
  )
}

export default HeadlessDataVisualizationSection;