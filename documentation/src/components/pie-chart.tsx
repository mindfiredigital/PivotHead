// import React, { useEffect, useState, useRef } from 'react';
// import  '../css/custom.css';

// const pieData = [
//   { label: 'North', value: 40, color: '#f87171' },
//   { label: 'South', value: 25, color: '#fb923c' },
//   { label: 'East', value: 20, color: '#fbbf24' },
//   { label: 'West', value: 15, color: '#a3e635' },
// ];

// export default function AnimatedPieChart() {
//     const [inView, setInView] = useState(false);
//     const ref = useRef(null);
  
//     useEffect(() => {
//       if (typeof window === 'undefined' || !ref.current) return;

//       const observer = new IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting) {
//             setInView(true);
//             observer.disconnect();
//           }
//         },
//         {
//           threshold: 0.1,
//         }
//       );
  
//       observer.observe(ref.current);
      
//       return () => {
//         observer.disconnect();
//       };
//     }, []);

//     const total = pieData.reduce((sum, item) => sum + item.value, 0);
//     const radius = 80;
//     const circumference = 2 * Math.PI * radius;
//     let accumulatedPercentage = 0;

//   return (
//     <div ref={ref} className="chartContainer pieChartContainer">
//       <svg viewBox="0 0 250 250" className="chartSvg">
//         <g transform="translate(125, 125) rotate(-90)">
//           {pieData.map((d, i) => {
//               const percentage = d.value / total;
//               const dashArray = circumference;
//               const dashOffset = dashArray * (1 - percentage);
//               const rotation = accumulatedPercentage * 360;
//               accumulatedPercentage += percentage;

//               return (
//                 <circle
//                   key={d.label}
//                   r={radius}
//                   cx="0"
//                   cy="0"
//                   fill="transparent"
//                   stroke={d.color}
//                   strokeWidth="30"
//                   strokeDasharray={dashArray}
//                   strokeDashoffset={inView ? dashOffset : dashArray}
//                   transform={`rotate(${rotation})`}
//                   className="pieSlice"
//                   style={{ transitionDelay: `${i * 150}ms` }}
//                 />
//               );
//           })}
//         </g>
//       </svg>
//       <div className="legend">
//         {pieData.map(d => (
//             <div key={d.label} className="legendItem">
//                 <span className="legendColorBox" style={{backgroundColor: d.color}}></span>
//                 <span className="legendText">{d.label}</span>
//             </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React from 'react';
import '../css/custom.css';

const pieData = [
  { label: 'North', value: 40, color: '#f87171' },
  { label: 'South', value: 25, color: '#fb923c' },
  { label: 'East', value: 20, color: '#fbbf24' },
  { label: 'West', value: 15, color: '#a3e635' },
];

export default function AnimatedPieChart(): React.JSX.Element {
  const total = pieData.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <div className="chartContainer pieChartContainer">
      <svg viewBox="0 0 250 250" className="chartSvg">
        <g transform="translate(125, 125)">
          <g transform="rotate(-90)" className="pieRotate">
            {pieData.map((d) => {
              const percentage = d.value / total;
              const sliceLength = circumference * percentage;
              // Adjust gap size as needed
              const gapLength = 4;
              const strokeDasharray = `${sliceLength - gapLength} ${circumference - sliceLength + gapLength}`;

              const rotation = accumulatedPercentage * 360;
              accumulatedPercentage += percentage;

              return (
                <circle
                  key={d.label}
                  r={radius}
                  cx="0"
                  cy="0"
                  fill="transparent"
                  stroke={d.color}
                  strokeWidth="30"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  transform={`rotate(${rotation})`}
                  className="pieSlice"
                />
              );
            })}
          </g>
        </g>
      </svg>
      <div className="legend">
        {pieData.map(d => (
          <div key={d.label} className="legendItem">
            <span className="legendColorBox" style={{ backgroundColor: d.color }}></span>
            <span className="legendText">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

