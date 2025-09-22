// // import React, { useEffect, useState, useRef } from 'react';
// // import '../css/custom.css';

// // const lineData = [
// //   { x: 50, y: 200 },
// //   { x: 120, y: 120 },
// //   { x: 190, y: 150 },
// //   { x: 260, y: 80 },
// //   { x: 330, y: 100 },
// // ];

// // function pointsToPath(points) {
// //     if (!points || points.length === 0) return '';
// //     const command = (point, i) => {
// //       if (i === 0) return `M ${point.x} ${point.y}`;
// //       return `L ${point.x} ${point.y}`;
// //     };
// //     return points.map(command).join(' ');
// // }


// // export default function AnimatedLineChart() {
// //   const [inView, setInView] = useState(false);
// //   const ref = useRef(null);
// //   const pathRef = useRef<SVGPathElement | null>(null);

// //   useEffect(() => {
// //     if (typeof window === 'undefined' || !ref.current) return;
    
// //     const observer = new IntersectionObserver(
// //       ([entry]) => {
// //         if (entry.isIntersecting) {
// //           setInView(true);
// //           observer.disconnect();
// //         }
// //       },
// //       {
// //         threshold: 0.1,
// //       }
// //     );

// //     observer.observe(ref.current);
    
// //     return () => {
// //        observer.disconnect();
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (inView && pathRef.current) {
// //       const length = pathRef.current.getTotalLength();
// //       pathRef.current.style.strokeDasharray = length.toString();
// //       pathRef.current.style.strokeDashoffset = length.toString();
// //     }
// //   }, [inView]);


// //   const pathD = pointsToPath(lineData);

// //   return (
// //     <div ref={ref} className="chartContainer">
// //       <svg viewBox="0 0 400 300" className="chartSvg">
// //          {/* Grid lines */}
// //          {[50, 100, 150, 200, 250].map(y => (
// //           <line key={y} x1="40" y1={y} x2="360" y2={y} className="gridLine"/>
// //         ))}
// //         <path
// //           ref={pathRef}
// //           d={pathD}
// //           fill="none"
// //           stroke="#ef4444"
// //           strokeWidth="3"
// //           className={inView ? 'lineAnimate' : ''}
// //         />
// //         {lineData.map((p, i) => (
// //           <circle
// //             key={i}
// //             cx={p.x}
// //             cy={p.y}
// //             r="5"
// //             fill="var(--ifm-background-color)"
// //             stroke="#ef4444"
// //             strokeWidth="2"
// //             className={inView ? 'dotAnimate' : ''}
// //             style={{ animationDelay: `${i * 200 + 500}ms`}}
// //           />
// //         ))}
// //       </svg>
// //     </div>
// //   );
// // }


// import React from 'react';
// import styles from './AnimatedCharts.module.css';

// const lineData = [
//   { x: 50, y: 200 },
//   { x: 120, y: 120 },
//   { x: 190, y: 150 },
//   { x: 260, y: 80 },
//   { x: 330, y: 100 },
// ];

// function pointsToPath(points: { x: number; y: number }[]): string {
//   if (!points || points.length === 0) return '';
//   const command = (point: { x: number; y: number }, i: number) => {
//     if (i === 0) return `M ${point.x} ${point.y}`;
//     return `L ${point.x} ${point.y}`;
//   };
//   return points.map(command).join(' ');
// }

// export default function AnimatedLineChart(): JSX.Element {
//   const pathD = pointsToPath(lineData);

//   return (
//     <div className={styles.chartContainer}>
//       <svg viewBox="0 0 400 300" className={styles.chartSvg}>
//         {/* Grid lines */}
//         {[50, 100, 150, 200, 250].map(y => (
//           <line key={y} x1="40" y1={y} x2="360" y2={y} className={styles.gridLine} />
//         ))}

//         {/* Gradient Definition for Shimmer Effect */}
//         <defs>
//           <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
//             <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
//             <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
//           </linearGradient>
//         </defs>

//         {/* Base Path (background) */}
//         <path
//           d={pathD}
//           fill="none"
//           stroke="#ef4444"
//           strokeOpacity="0.3"
//           strokeWidth="3"
//         />
//         {/* Animated Shimmer Path */}
//         <path
//           d={pathD}
//           fill="none"
//           stroke="url(#line-gradient)"
//           strokeWidth="4"
//           className={styles.lineAnimate}
//         />

//         {/* Data Points */}
//         {lineData.map((p, i) => (
//           <circle
//             key={i}
//             cx={p.x}
//             cy={p.y}
//             r="5"
//             fill="var(--ifm-background-color)"
//             stroke="#ef4444"
//             strokeWidth="2"
//             className={styles.dotAnimate}
//             style={{ animationDelay: `${i * 300}ms` }}
//           />
//         ))}
//       </svg>
//     </div>
//   );
// }



import React from 'react';
import '../css/custom.css';

const lineData = [
  { x: 50, y: 200 },
  { x: 120, y: 120 },
  { x: 190, y: 150 },
  { x: 260, y: 80 },
  { x: 330, y: 100 },
];

function pointsToPath(points: { x: number; y: number }[]): string {
    if (!points || points.length === 0) return '';
    const command = (point: { x: number; y: number }, i: number) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    };
    return points.map(command).join(' ');
}


export default function AnimatedLineChart(): React.JSX.Element {
  const pathD = pointsToPath(lineData);

  return (
    <div className="chartContainer">
      <svg viewBox="0 0 400 300" className="chartSvg">
         {/* Grid lines */}
         {[50, 100, 150, 200, 250].map(y => (
          <line key={y} x1="40" y1={y} x2="360" y2={y} className="gridLine"/>
        ))}
         <defs>
          <linearGradient id="line-gradient-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke="#ef4444"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#line-gradient-shimmer)"
          strokeWidth="4"
          className="lineAnimate"
        />
        {lineData.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill="var(--ifm-background-color)"
            stroke="#ef4444"
            strokeWidth="2"
            className="dotAnimate"
            style={{ animationDelay: `${i * 300}ms`}}
          />
        ))}
      </svg>
    </div>
  );
}

