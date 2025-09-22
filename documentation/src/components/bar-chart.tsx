// import React, { useEffect, useState, useRef } from 'react';
// import '../css/custom.css';

// const barData = [
//   { label: 'North', value: 35, color: '#f87171' },
//   { label: 'South', value: 25, color: '#fb923c' },
//   { label: 'East', value: 20, color: '#fbbf24' },
//   { label: 'West', value: 30, color: '#a3e635' },
// ];

// export default function AnimatedBarChart() {
//   const [inView, setInView] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     // Ensure this code runs only in the browser
//     if (typeof window === 'undefined' || !ref.current) {
//       return;
//     }
    
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setInView(true);
//           observer.disconnect();
//         }
//       },
//       {
//         threshold: 0.1,
//       }
//     );

//     observer.observe(ref.current);

//     return () => {
//       observer.disconnect();
//     };
//   }, []);


//   const maxValue = Math.max(...barData.map(d => d.value));

//   return (
//     <div ref={ref} className="chartContainer">
//       <svg viewBox="0 0 400 300" className="chartSvg">
//         {/* Y-axis lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map(tick => (
//           <g key={tick} transform={`translate(0, ${250 - tick * 220})`}>
//             <line x1="40" x2="380" className="gridLine" />
//             <text x="35" y="5" textAnchor="end" className="axisLabel">
//               {tick * maxValue}K
//             </text>
//           </g>
//         ))}

//         {/* Bars */}
//         {barData.map((d, i) => {
//           const barHeight = (d.value / maxValue) * 220;
//           return (
//             <g key={d.label} transform={`translate(${(i * 340 / barData.length) + 65}, 0)`}>
//               <rect
//                 className={inView ? 'barAnimate' : ''}
//                 x="0"
//                 y={250 - barHeight}
//                 width="40"
//                 height={barHeight}
//                 fill={d.color}
//                 style={{ animationDelay: `${i * 150}ms`}}
//               />
//               <text x="20" y="270" textAnchor="middle" className="barLabel">
//                 {d.label}
//               </text>
//             </g>
//           );
//         })}
//          <line x1="40" y1="250" x2="380" y2="250" className="axisLine" />
//       </svg>
//     </div>
//   );
// }



import React, { JSX } from 'react';
import '../css/custom.css';

const barData = [
  { label: 'North', value: 35, color: '#f87171' },
  { label: 'South', value: 25, color: '#fb923c' },
  { label: 'East', value: 20, color: '#fbbf24' },
  { label: 'West', value: 30, color: '#a3e635' },
];

export default function AnimatedBarChart(): JSX.Element {
  const maxValue = Math.max(...barData.map(d => d.value));

  return (
    <div className="chartContainer">
      <svg viewBox="0 0 400 300" className="chartSvg">
        {/* Y-axis lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
          <g key={tick} transform={`translate(0, ${250 - tick * 220})`}>
            <line x1="40" x2="380" className="gridLine" />
            <text x="35" y="5" textAnchor="end" className="axisLabel">
              {tick * maxValue}
            </text>
          </g>
        ))}

        {/* Bars */}
        {barData.map((d, i) => {
          const barHeight = (d.value / maxValue) * 220;
          return (
            <g key={d.label} transform={`translate(${(i * 340 / barData.length) + 65}, 0)`}>
              <rect
                className="barAnimate"
                x="0"
                y={250 - barHeight}
                width="40"
                height={barHeight}
                fill={d.color}
                style={{ animationDelay: `${i * 200}ms`}}
              />
              <text x="20" y="270" textAnchor="middle" className="barLabel">
                {d.label}
              </text>
            </g>
          );
        })}
         <line x1="40" y1="250" x2="380" y2="250" className="axisLine" />
      </svg>
    </div>
  );
}

