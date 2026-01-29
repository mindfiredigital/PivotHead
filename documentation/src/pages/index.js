'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';
import React from 'react';
import '../css/custom.css';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';

import { Boxes } from '../components/bg-box';
import { MorphingText } from '../components/morphing-text';
import { GridBeams } from '../components/light-ray';
import TextType from '../components/text-type';
import BrowserOnly from '@docusaurus/BrowserOnly';

import HeadlessDataVisualizationSection from '../components/dataVisualisation';

// --- Icon Components ---
const BarChartIcon = () => (
  <svg
    className={styles.logoIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const GithubIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);
const SparklesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9z"></path>
  </svg>
);
const PlayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const ZapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 2.73.73l-.15-.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
const CodeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);
const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ReactLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
    <title>React Logo</title>
    <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
    <g stroke="#61dafb" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);
const AngularLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
    <title>Angular Logo</title>
    <polygon
      fill="#DD0031"
      points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2"
    />
    <polygon
      fill="#C3002F"
      points="125,30 125,52.2 125,52.1 125,153.4 125,153.4 125,230 125,230 203.9,186.3 218.1,63.2 125,30"
    />
    <path
      fill="#FFFFFF"
      d="M125,52.1L66.8,182.6h0h21.7h0l11.7-29.2h49.4l11.7,29.2h0h21.7h0L125,52.1L125,52.1L125,52.1L125,52.1L125,52.1z M142,135.4H108l17-40.9L142,135.4z"
    />
  </svg>
);
const VueLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.76 226.69">
    <title>Vue Logo</title>
    <path
      fill="#41B883"
      d="M211.92,0H261.76L130.88,226.69L0,0H98.59L130.88,53.39L163.17,0H211.92Z"
    />
    <path
      fill="#34495E"
      d="M0,0L130.88,226.69L261.76,0H211.92L130.88,135.89L50,0H0Z"
    />
  </svg>
);

// const JSLogo = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
//         <title>JavaScript Logo</title>
//         <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
//         <path fill="#000001" d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"></path>
//     </svg>
// );

const JSLogo = () => (
  // The width="100" and height="100" attributes have been removed
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
    <title>JavaScript Logo</title>
    <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
    <path
      fill="#000001"
      d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"
    ></path>
  </svg>
);

function HeroSection() {
  const { colorMode } = useColorMode();

  return (
    <section
      className={clsx(
        'relative flex w-full flex-col items-center justify-center overflow-hidden',
        colorMode === 'dark' ? 'bg-slate-900' : 'bg-white'
      )}
    >
      <div
        className={clsx(
          'absolute inset-0 z-10 h-full w-full [mask-image:radial-gradient(transparent,white)] pointer-events-none',
          colorMode === 'dark' ? 'bg-black' : 'bg-white'
        )}
      />
      <Boxes />
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 md:py-32">
        {/* Floating Badge */}
        <div className="animate-fade-in-up mb-8">
          <div
            className={clsx(
              'inline-flex items-center rounded-full border px-6 py-2 text-sm font-medium shadow-lg backdrop-blur-sm',
              colorMode === 'dark'
                ? 'border-red-200/30 bg-white/10 text-white/90'
                : 'border-red-200 bg-red-50 text-red-700'
            )}
          >
            <span className="relative mr-3 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            PIVOT HEAD - YOUR UI. OUR ENGINE.
          </div>
        </div>

        {/* Main Headline with Light Rays */}
        <div className="animate-fade-in-up-delay mb-8 [animation-delay:200ms] relative">
          {/* Light Rays Container */}
          <div className="absolute inset-0 pointer-events-none">
            {/* <GridBeams
              gridSize={20}
              gridColor={colorMode === 'dark' ? '#ef4444' : '#dc2626'}
              rayCount={8}
              rayOpacity={0.3}
              raySpeed={0.8}
              rayLength="60vh"
              gridFadeStart={10}
              gridFadeEnd={80}
              backgroundColor="transparent"
              className="w-full h-full"
            /> */}
          </div>

          <h1
            className={clsx(
              'mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl relative z-10',
              colorMode === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Unlock the Stories Hidden in Your Data
          </h1>

          <div className="flex justify-center items-center relative z-10">
            <span
              className={clsx(
                'text-5xl font-black bg-clip-text text-transparent sm:text-6xl lg:text-7xl mt-4',
                colorMode === 'dark'
                  ? 'bg-gradient-to-r from-red-500 via-white to-slate-400' // Dark mode friendly
                  : 'bg-gradient-to-r from-red-600 via-slate-700 to-black' // Light mode friendly
              )}
            >
              PivotHead
            </span>
          </div>
        </div>

        {/* Animated Subtitle using TextType */}
        <div className="animate-fade-in-up-delay mb-12 [animation-delay:400ms]">
          <div
            className={clsx(
              'text-lg leading-relaxed opacity-90 sm:text-xl lg:text-2xl',
              colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            <TextType
              text={[
                'Headless by Design. Powerful by Nature.',
                "Don't just analyze your data. Design it.",
              ]}
              typingSpeed={80}
              deletingSpeed={50}
              pauseDuration={3000}
              loop={true}
              showCursor={true}
              cursorCharacter="|"
              className="inline-block"
              textColors={
                colorMode === 'dark'
                  ? ['#f8fafc', '#e2e8f0', '#cbd5e1']
                  : ['#1e293b', '#334155', '#475569']
              }
            />
          </div>
          <p
            className={clsx(
              'mt-4 text-base leading-relaxed opacity-80 sm:text-lg',
              colorMode === 'dark' ? 'text-slate-300' : 'text-slate-900'
            )}
          >
            <span className="font-semibold text-red-500">
              The First Headless Pivot Table Library for Modern Developers
            </span>{' '}
            - let your creativity run wild
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up-delay mb-16 flex flex-col justify-center gap-6 [animation-delay:600ms] sm:flex-row">
          <Link
            to="/docs/Installation"
            className="btn-base group bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-1"
          >
            <SparklesIcon />
            <span>Get Started</span>
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            to="#"
            className={clsx(
              'btn-base',
              colorMode === 'dark'
                ? 'border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:border-slate-600'
                : 'border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
            )}
          >
            <PlayIcon />
            <span>View Demo</span>
          </Link>
        </div>

        <div className={clsx(styles.commandContainer)}>
          <button
            className={clsx(
              styles.commandButton,
              styles.redGlowButton,
              'animate-fade-in-up-delay [animation-delay:800ms]'
            )}
            onClick={() => {
              navigator.clipboard.writeText('npm i @mindfiredigital/pivothead');
            }}
          >
            <CopyIcon />
            <span>npm i @mindfiredigital/pivothead</span>
          </button>
          <Link
            to="https://github.com/mindfiredigital/PivotHead"
            className={clsx(
              styles.commandButton,
              styles.redGlowButton,
              'animate-fade-in-up-delay [animation-delay:900ms]'
            )}
          >
            <GithubIcon />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// function DataVisualizationSection() {
//   return (
//     <div className={`${styles.section} ${styles.sectionWhite}`}>
//       <div className="container">
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.sectionTitle}>From Raw Data to Actionable Insights</h2>
//           <p className={styles.sectionDescription}>
//             PivotHead transforms complex datasets into clear, interactive pivot tables. No charts or graphs needed—all the power is in the table itself.
//           </p>
//         </div>

//         <div className={styles.pivotTableFeatureContainer}>
//             <img src="./img/modern-data.png" alt="Pivot Table Preview" className={styles.dashboardImage} />
//         </div>

//         <div className={`${styles.grid} ${styles.lgGridCols3} ${styles.mdGridCols2} ${styles.featureGrid}`}>
//           <div className={styles.card}>
//             <h3 className={styles.cardTitle}>Dynamic Pivoting</h3>
//             <p className={styles.cardDescription}>Transform and analyze data from multiple perspectives. An interactive UI with a drag & drop interface allows for easy reorganization.</p>
//           </div>
//           <div className={styles.card}>
//             <h3 className={styles.cardTitle}>Advanced Aggregation</h3>
//             <p className={styles.cardDescription}>Apply sum, average, count, min, max, and even custom aggregations to summarize your data effectively.</p>
//           </div>
//           <div className={styles.card}>
//             <h3 className={styles.cardTitle}>Sorting & Filtering</h3>
//             <p className={styles.cardDescription}>Utilize comprehensive options for data refinement, allowing users to drill down into the information that matters most.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function AnimatedPivotTableVisual() {
//   const [isPivoted, setIsPivoted] = useState(false);
//   const { colorMode } = useColorMode();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsPivoted(prev => !prev);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   const rawData = [
//     { product: 'Widget A', region: 'North', sales: '$1,000' },
//     { product: 'Widget B', region: 'North', sales: '$1,500' },
//     { product: 'Widget A', region: 'South', sales: '$1,200' },
//     { product: 'Widget B', region: 'South', sales: '$1,800' },
//   ];

//   return (
//     <div className={styles.animTableWrapper}>
//       <div className={clsx(styles.animTable, isPivoted && styles.pivoted, colorMode === 'dark' && styles.darkMode)}>
//         {/* Headers */}
//         <div className={clsx(styles.animCell, styles.header, styles.productHeader)}>Product</div>
//         <div className={clsx(styles.animCell, styles.header, styles.regionHeader)}>Region</div>
//         <div className={clsx(styles.animCell, styles.header, styles.salesHeader)}>Sales</div>

//         {/* Data Cells */}
//         {rawData.map((row, index) => (
//           <React.Fragment key={index}>
//             <div className={clsx(styles.animCell, styles.productCell, `cell-${index}`)}>{row.product}</div>
//             <div className={clsx(styles.animCell, styles.regionCell, `cell-${index}`)}>{row.region}</div>
//             <div className={clsx(styles.animCell, styles.salesCell, `cell-${index}`)}>{row.sales}</div>
//           </React.Fragment>
//         ))}

//         {/* Pivoted Headers and Cells */}
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.header, styles.northHeader)}>North</div>
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.header, styles.southHeader)}>South</div>
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.data, styles.waNorth)}> $1,000 </div>
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.data, styles.waSouth)}> $1,200 </div>
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.data, styles.wbNorth)}> $1,500 </div>
//         <div className={clsx(styles.animCell, styles.pivotedOnly, styles.data, styles.wbSouth)}> $1,800 </div>
//       </div>
//     </div>
//   );
// }

// function AnimatedPivotTableVisual() {
//   const [isPivoted, setIsPivoted] = useState(false);
//   const { colorMode } = useColorMode();

//   useEffect(() => {
//     // This will toggle the animation back and forth to keep it looping
//     const interval = setInterval(() => {
//       setIsPivoted(prev => !prev);
//     }, 4000); // Toggles every 4 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const rawData = [
//     { product: 'Widget A', region: 'North', sales: '$1,000' },
//     { product: 'Widget B', region: 'North', sales: '$1,500' },
//     { product: 'Widget A', region: 'South', sales: '$1,200' },
//     { product: 'Widget B', region: 'South', sales: '$1,800' },
//   ];

//   return (
//     <div className={styles.animTableWrapper}>
//       <div
//         className={clsx(
//           styles.animTable,
//           isPivoted && styles.pivoted,
//           colorMode === 'dark' && styles.darkMode
//         )}
//       >
//         {/* Headers */}
//         <div
//           className={clsx(styles.animCell, styles.header, styles.productHeader)}
//         >
//           Product
//         </div>
//         <div
//           className={clsx(styles.animCell, styles.header, styles.regionHeader)}
//         >
//           Region
//         </div>
//         <div
//           className={clsx(styles.animCell, styles.header, styles.salesHeader)}
//         >
//           Sales
//         </div>

//         {/* Data Cells from Raw Data */}
//         {rawData.map((row, index) => (
//           <React.Fragment key={index}>
//             <div
//               className={clsx(
//                 styles.animCell,
//                 styles.productCell,
//                 `cell-${index}`
//               )}
//             >
//               {row.product}
//             </div>
//             <div
//               className={clsx(
//                 styles.animCell,
//                 styles.regionCell,
//                 `cell-${index}`
//               )}
//             >
//               {row.region}
//             </div>
//             <div
//               className={clsx(
//                 styles.animCell,
//                 styles.salesCell,
//                 `cell-${index}`
//               )}
//             >
//               {row.sales}
//             </div>
//           </React.Fragment>
//         ))}

//         {/* Headers and Cells that only appear in the pivoted state */}
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.header,
//             styles.northHeader
//           )}
//         >
//           North
//         </div>
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.header,
//             styles.southHeader
//           )}
//         >
//           South
//         </div>
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.data,
//             styles.waNorth
//           )}
//         >
//           {' '}
//           $1,000{' '}
//         </div>
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.data,
//             styles.waSouth
//           )}
//         >
//           {' '}
//           $1,200{' '}
//         </div>
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.data,
//             styles.wbNorth
//           )}
//         >
//           {' '}
//           $1,500{' '}
//         </div>
//         <div
//           className={clsx(
//             styles.animCell,
//             styles.pivotedOnly,
//             styles.data,
//             styles.wbSouth
//           )}
//         >
//           {' '}
//           $1,800{' '}
//         </div>
//       </div>
//     </div>
//   );
// }

function FlashingTableVisual() {
  return (
    <div className={styles.flashingTableContainer}>
      <div className={styles.flashTable}>
        <div className={styles.flashCell}>Product</div>
        <div className={styles.flashCell}>North</div>
        <div className={styles.flashCell}>South</div>
        <div className={styles.flashCell}>Widget A</div>
        <div className={styles.flashCell}>$2,100</div>
        <div className={styles.flashCell}>$1,300</div>
        <div className={styles.flashCell}>Widget B</div>
        <div className={styles.flashCell}>$3,100</div>
        <div className={styles.flashCell}>$3,700</div>
      </div>
      <div className={styles.logoBar}>
        <div className={styles.frameworkLogoWrapper}>
          <JSLogo />
        </div>
        <div className={styles.frameworkLogoWrapper}>
          <ReactLogo />
        </div>
        <div className={styles.frameworkLogoWrapper}>
          <AngularLogo />
        </div>
        <div className={styles.frameworkLogoWrapper}>
          <VueLogo />
        </div>
      </div>
    </div>
  );
}

// Charts Visualization Section Component
function ChartsVisualizationSection() {
  const { colorMode } = useColorMode();

  const chartTypes = [
    {
      name: 'Bar Charts',
      description:
        'Compare data across categories with animated bar visualizations',
    },
    {
      name: 'Line Charts',
      description: 'Track trends over time with smooth animated line graphs',
    },
    {
      name: 'Pie Charts',
      description:
        'Visualize proportions and distributions with dynamic pie segments',
    },
    {
      name: 'Area Charts',
      description:
        'Display cumulative data with beautifully filled area visualizations',
    },
  ];

  return (
    <div
      className={clsx(
        styles.section,
        colorMode === 'dark' ? 'bg-slate-950' : 'bg-white'
      )}
    >
      <div className="container">
        <div
          className={clsx(
            'text-center mb-12',
            'transition-all duration-1000',
            'opacity-100 translate-y-0'
          )}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <BarChartIcon />
            <span
              className={clsx(
                'ml-2 text-sm font-semibold uppercase tracking-wider',
                colorMode === 'dark' ? 'text-red-400' : 'text-red-600'
              )}
            >
              Data Visualization
            </span>
          </div>
          <h2
            className={clsx(
              'text-4xl font-bold mb-4',
              colorMode === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Beautiful Charts & Graphs
          </h2>
          <p
            className={clsx(
              'text-xl max-w-3xl mx-auto',
              colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            Transform your pivot data into stunning visualizations. PivotHead
            supports multiple chart types with smooth animations and full
            customization.
          </p>
        </div>

        {/* Chart Types Grid - 4 Animated Cards */}
        <div
          className={clsx(
            'grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto',
            'transition-all duration-1000 delay-200',
            'opacity-100 translate-y-0'
          )}
        >
          {/* Bar Chart Card */}
          <div
            className={clsx(
              styles.chartCard,
              colorMode === 'dark' ? styles.chartCardDark : ''
            )}
          >
            <div
              className={clsx(
                styles.chartIconWrapperLarge,
                styles.chartIconAnimate
              )}
            >
              <svg viewBox="0 0 120 100" className={styles.chartIconLarge}>
                {/* Grid lines */}
                <line
                  x1="15"
                  y1="85"
                  x2="110"
                  y2="85"
                  stroke={colorMode === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeWidth="1"
                />
                {/* Animated bars */}
                <rect
                  x="20"
                  y="55"
                  width="16"
                  height="30"
                  rx="2"
                  fill="#ef4444"
                  className={styles.animatedBar}
                  style={{ animationDelay: '0s' }}
                />
                <rect
                  x="42"
                  y="35"
                  width="16"
                  height="50"
                  rx="2"
                  fill="#f97316"
                  className={styles.animatedBar}
                  style={{ animationDelay: '0.1s' }}
                />
                <rect
                  x="64"
                  y="25"
                  width="16"
                  height="60"
                  rx="2"
                  fill="#eab308"
                  className={styles.animatedBar}
                  style={{ animationDelay: '0.2s' }}
                />
                <rect
                  x="86"
                  y="45"
                  width="16"
                  height="40"
                  rx="2"
                  fill="#22c55e"
                  className={styles.animatedBar}
                  style={{ animationDelay: '0.3s' }}
                />
              </svg>
            </div>
            <h3
              className={clsx(
                'text-lg font-semibold mb-2 text-center',
                colorMode === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              {chartTypes[0].name}
            </h3>
            <p
              className={clsx(
                'text-sm text-center',
                colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              {chartTypes[0].description}
            </p>
          </div>

          {/* Line Chart Card */}
          <div
            className={clsx(
              styles.chartCard,
              colorMode === 'dark' ? styles.chartCardDark : ''
            )}
          >
            <div
              className={clsx(
                styles.chartIconWrapperLarge,
                styles.chartIconAnimate
              )}
            >
              <svg viewBox="0 0 120 100" className={styles.chartIconLarge}>
                <defs>
                  <linearGradient
                    id="cardLineGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop
                      offset="100%"
                      stopColor="#ef4444"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>
                {/* Grid line */}
                <line
                  x1="15"
                  y1="85"
                  x2="110"
                  y2="85"
                  stroke={colorMode === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeWidth="1"
                />
                {/* Area fill */}
                <path
                  d="M15,65 L35,45 L55,55 L75,30 L95,40 L110,25 L110,85 L15,85 Z"
                  fill="url(#cardLineGradient)"
                  className={styles.animatedAreaFill}
                />
                {/* Main line */}
                <polyline
                  points="15,65 35,45 55,55 75,30 95,40 110,25"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.animatedLine}
                />
                {/* Data points */}
                <circle
                  cx="15"
                  cy="65"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '0.6s' }}
                />
                <circle
                  cx="35"
                  cy="45"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '0.7s' }}
                />
                <circle
                  cx="55"
                  cy="55"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '0.8s' }}
                />
                <circle
                  cx="75"
                  cy="30"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '0.9s' }}
                />
                <circle
                  cx="95"
                  cy="40"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '1.0s' }}
                />
                <circle
                  cx="110"
                  cy="25"
                  r="5"
                  fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                  stroke="#ef4444"
                  strokeWidth="2"
                  className={styles.animatedDot}
                  style={{ animationDelay: '1.1s' }}
                />
              </svg>
            </div>
            <h3
              className={clsx(
                'text-lg font-semibold mb-2 text-center',
                colorMode === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              {chartTypes[1].name}
            </h3>
            <p
              className={clsx(
                'text-sm text-center',
                colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              {chartTypes[1].description}
            </p>
          </div>

          {/* Pie Chart Card */}
          <div
            className={clsx(
              styles.chartCard,
              colorMode === 'dark' ? styles.chartCardDark : ''
            )}
          >
            <div
              className={clsx(
                styles.chartIconWrapperLarge,
                styles.chartIconAnimate
              )}
            >
              <svg viewBox="0 0 120 100" className={styles.chartIconLarge}>
                <g transform="translate(60, 50)">
                  {/* Pie segments */}
                  <circle
                    r="35"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="18"
                    strokeDasharray="55 220"
                    strokeDashoffset="0"
                    className={styles.animatedPieSegment}
                    style={{ animationDelay: '0s' }}
                  />
                  <circle
                    r="35"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="18"
                    strokeDasharray="44 220"
                    strokeDashoffset="-55"
                    className={styles.animatedPieSegment}
                    style={{ animationDelay: '0.1s' }}
                  />
                  <circle
                    r="35"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="18"
                    strokeDasharray="33 220"
                    strokeDashoffset="-99"
                    className={styles.animatedPieSegment}
                    style={{ animationDelay: '0.2s' }}
                  />
                  <circle
                    r="35"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="18"
                    strokeDasharray="44 220"
                    strokeDashoffset="-132"
                    className={styles.animatedPieSegment}
                    style={{ animationDelay: '0.3s' }}
                  />
                  <circle
                    r="35"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="18"
                    strokeDasharray="44 220"
                    strokeDashoffset="-176"
                    className={styles.animatedPieSegment}
                    style={{ animationDelay: '0.4s' }}
                  />
                  {/* Center circle */}
                  <circle
                    r="18"
                    fill={colorMode === 'dark' ? '#1e293b' : 'white'}
                    className={styles.animatedPieCenter}
                  />
                </g>
              </svg>
            </div>
            <h3
              className={clsx(
                'text-lg font-semibold mb-2 text-center',
                colorMode === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              {chartTypes[2].name}
            </h3>
            <p
              className={clsx(
                'text-sm text-center',
                colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              {chartTypes[2].description}
            </p>
          </div>

          {/* Area Chart Card */}
          <div
            className={clsx(
              styles.chartCard,
              colorMode === 'dark' ? styles.chartCardDark : ''
            )}
          >
            <div
              className={clsx(
                styles.chartIconWrapperLarge,
                styles.chartIconAnimate
              )}
            >
              <svg viewBox="0 0 120 100" className={styles.chartIconLarge}>
                <defs>
                  <linearGradient
                    id="cardAreaGradient1"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient
                    id="cardAreaGradient2"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>
                {/* Grid line */}
                <line
                  x1="15"
                  y1="85"
                  x2="110"
                  y2="85"
                  stroke={colorMode === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeWidth="1"
                />
                {/* Blue area (back) */}
                <path
                  d="M15,60 Q40,40 60,50 T105,30 L105,85 L15,85 Z"
                  fill="url(#cardAreaGradient2)"
                  className={styles.animatedAreaPath}
                  style={{ animationDelay: '0.2s' }}
                />
                <path
                  d="M15,60 Q40,40 60,50 T105,30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={styles.animatedAreaLine}
                  style={{ animationDelay: '0.4s' }}
                />
                {/* Red area (front) */}
                <path
                  d="M15,75 Q40,55 60,65 T105,45 L105,85 L15,85 Z"
                  fill="url(#cardAreaGradient1)"
                  className={styles.animatedAreaPath}
                  style={{ animationDelay: '0s' }}
                />
                <path
                  d="M15,75 Q40,55 60,65 T105,45"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={styles.animatedAreaLine}
                  style={{ animationDelay: '0.2s' }}
                />
              </svg>
            </div>
            <h3
              className={clsx(
                'text-lg font-semibold mb-2 text-center',
                colorMode === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              {chartTypes[3].name}
            </h3>
            <p
              className={clsx(
                'text-sm text-center',
                colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              {chartTypes[3].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// WASM Performance Showcase Component
function WasmPerformanceShowcase() {
  const { colorMode } = useColorMode();
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Update progress based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight * 0.2;

      // Calculate how much of the section is visible
      // Progress starts when section enters viewport and completes when it exits
      const sectionHeight = rect.height * 0.5;
      const scrollProgress = Math.min(
        Math.max(
          ((windowHeight - rect.top) / (windowHeight + sectionHeight)) * 100,
          0
        ),
        100
      );

      setUploadProgress(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      className={clsx(
        styles.section,
        colorMode === 'dark' ? 'bg-black' : 'bg-slate-50'
      )}
    >
      <div className="container">
        <div
          className={clsx(
            'text-center mb-12',
            'transition-all duration-1000',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <ZapIcon />
            <span
              className={clsx(
                'ml-2 text-sm font-semibold uppercase tracking-wider',
                colorMode === 'dark' ? 'text-red-400' : 'text-red-600'
              )}
            >
              Lightning Fast Performance
            </span>
          </div>
          <h2
            className={clsx(
              'text-4xl font-bold mb-4',
              colorMode === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Handle 1GB Files with Ease
          </h2>
          <p
            className={clsx(
              'text-xl max-w-3xl mx-auto',
              colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            Powered by WebAssembly for blazing-fast CSV processing. Watch as
            PivotHead automatically optimizes performance based on file size.
          </p>
        </div>

        <div
          className={clsx(
            'max-w-5xl mx-auto',
            'transition-all duration-1000 delay-300',
            inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          {/* Upload Progress Visualization */}
          <div
            className={clsx(
              'p-8 rounded-2xl border',
              colorMode === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div
                  className={clsx(
                    'text-sm font-medium mb-1',
                    colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Uploading large-dataset.csv
                </div>
                <div
                  className={clsx(
                    'text-lg font-bold',
                    colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {uploadProgress.toFixed(0)}% Complete
                </div>
              </div>
              <div
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-semibold',
                  colorMode === 'dark'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                )}
              >
                1.0 GB
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className={clsx(
                'relative h-4 rounded-full overflow-hidden',
                colorMode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
              )}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${uploadProgress}%`,
                  background:
                    'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div
                  className={clsx(
                    'text-2xl font-bold mb-1',
                    colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  2-3s
                </div>
                <div
                  className={clsx(
                    'text-xs',
                    colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  800 MB Processing
                </div>
              </div>
              <div className="text-center">
                <div className={clsx('text-2xl font-bold mb-1 text-red-500')}>
                  37x
                </div>
                <div
                  className={clsx(
                    'text-xs',
                    colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Faster with WASM
                </div>
              </div>
              <div className="text-center">
                <div
                  className={clsx(
                    'text-2xl font-bold mb-1',
                    colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  4MB
                </div>
                <div
                  className={clsx(
                    'text-xs',
                    colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Chunk Streaming
                </div>
              </div>
            </div>
          </div>

          {/* Feature Points */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div
              className={clsx(
                'p-6 rounded-lg',
                colorMode === 'dark' ? 'bg-slate-800/50' : 'bg-white'
              )}
            >
              <div className="text-3xl mb-3"></div>
              <h3
                className={clsx(
                  'font-semibold mb-2',
                  colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                Auto-Optimization
              </h3>
              <p
                className={clsx(
                  'text-sm',
                  colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Automatically selects the best processing mode based on file
                size
              </p>
            </div>
            <div
              className={clsx(
                'p-6 rounded-lg',
                colorMode === 'dark' ? 'bg-slate-800/50' : 'bg-white'
              )}
            >
              <div className="text-3xl mb-3"></div>
              <h3
                className={clsx(
                  'font-semibold mb-2',
                  colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                WebAssembly Powered
              </h3>
              <p
                className={clsx(
                  'text-sm',
                  colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Near-native performance for massive CSV files up to 1GB+
              </p>
            </div>
            <div
              className={clsx(
                'p-6 rounded-lg',
                colorMode === 'dark' ? 'bg-slate-800/50' : 'bg-white'
              )}
            >
              <div className="text-3xl mb-3"></div>
              <h3
                className={clsx(
                  'font-semibold mb-2',
                  colorMode === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                Streaming Support
              </h3>
              <p
                className={clsx(
                  'text-sm',
                  colorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Process files in 4MB chunks for memory-efficient handling
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernDevelopersSection() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className={`${styles.section} ${styles.sectionGray}`}>
      <div className="container">
        <div className={`${styles.grid} ${styles.lgGridCols2} items-center`}>
          <div
            className={clsx(
              styles.modernDevsContent,
              'transition-all duration-1000',
              inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            )}
          >
            <h2 className={styles.modernDevsTitle}>Designed for Flexibility</h2>
            <p className={styles.modernDevsDescription}>
              PivotHead's modular architecture separates its core logic from the
              UI, giving you complete control to build the exact data experience
              you need.
            </p>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIconContainer}>
                  <CodeIcon />
                </div>
                <span className={styles.benefitText}>
                  Use with Plain JS, React, Vue, or Angular
                </span>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIconContainer}>
                  <SettingsIcon />
                </div>
                <span className={styles.benefitText}>
                  Headless engine for custom UI development
                </span>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitIconContainer}>
                  <BarChartIcon />
                </div>
                <span className={styles.benefitText}>
                  Optional basic table UI to get started quickly
                </span>
              </li>
            </ul>
          </div>
          <div
            className={clsx(
              'transition-all duration-1000',
              inView ? styles.visualsInView : ''
            )}
          >
            <FlashingTableVisual />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this new Icon component with the others at the top of your file
// function StackBlitzSection() {
//   const frameworks = [
//     {
//       name: 'React',
//       icon: <ReactLogo />,
//       // IMPORTANT: Replace with your StackBlitz URL for the React example
//       url: 'https://stackblitz.com/edit/vitejs-vite-bzqbxqka?file=src%2Fpages%2FMinimalDemo.tsx?embed=1&file=src%2FApp.jsx&theme=dark'
//     },
//     {
//       name: 'Vue',
//       icon: <VueLogo />,
//       // IMPORTANT: Replace with your StackBlitz URL for the Vue example
//       url: 'https://stackblitz.com/edit/vitejs-vite-w3b5ea?embed=1&file=src%2FApp.vue&theme=dark'
//     },
//     {
//       name: 'Angular',
//       icon: <AngularLogo />,
//       // IMPORTANT: Replace with your StackBlitz URL for the Angular example
//       url: 'https://stackblitz.com/edit/vitejs-vite-b74f9g?embed=1&file=src%2Fapp%2Fapp.component.ts&theme=dark'
//     },
//     {
//       name: 'JavaScript',
//       icon: <JSLogo />,
//       // IMPORTANT: Replace with your StackBlitz URL for the Vanilla JS example
//       url: 'https://stackblitz.com/edit/vitejs-vite-tmz1b6?embed=1&file=main.js&theme=dark'
//     },
//   ];

//   const [activeFramework, setActiveFramework] = useState(frameworks[0]);

//   return (
//     <div className={`${styles.section} ${styles.sectionWhite}`}>
//       <div className="container">
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.sectionTitle}>Live Examples for Your Framework</h2>
//           <p className={styles.sectionDescription}>
//             Select a framework to see a live, interactive PivotHead example. No installation required.
//           </p>
//         </div>

//         <div className={styles.frameworkSelector}>
//           {frameworks.map((fw) => (
//             <button
//               key={fw.name}
//               onClick={() => setActiveFramework(fw)}
//               className={clsx(
//                 styles.frameworkButton,
//                 activeFramework.name === fw.name && styles.activeFrameworkButton
//               )}
//             >
//               <div className={styles.frameworkIcon}>{fw.icon}</div>
//               <span>{fw.name}</span>
//             </button>
//           ))}
//         </div>

//         <div className={styles.stackblitzContainer}>
//           <iframe
//             key={activeFramework.url} // This key is crucial to force the iframe to reload when the URL changes
//             src={activeFramework.url}
//             className={styles.stackblitzEmbed}
//             title={`${activeFramework.name} Live Demo on StackBlitz`}
//             allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
//             sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
//           ></iframe>
//         </div>
//       </div>
//     </div>
//   );
// }

function StackBlitzSection() {
  const { colorMode } = useColorMode(); // Docusaurus hook to get 'light' or 'dark'

  const frameworks = [
    {
      name: 'React',
      icon: <ReactLogo />,
      // NOTE: The "&theme=..." part is removed from the base URL
      url: 'https://stackblitz.com/edit/vitejs-vite-bzqbxqka?file=src%2Fpages%2FDefaultDemo.tsx?embed=1&file=src%2FApp.jsx',
    },
    {
      name: 'Vue',
      icon: <VueLogo />,
      url: 'https://stackblitz.com/edit/vitejs-vite-w3b5ea?embed=1&file=src%2FApp.vue',
    },
    {
      name: 'Angular',
      icon: <AngularLogo />,
      url: 'https://stackblitz.com/edit/vitejs-vite-b74f9g?embed=1&file=src%2Fapp%2Fapp.component.ts',
    },
    {
      name: 'JavaScript',
      icon: <JSLogo />,
      url: 'https://stackblitz.com/edit/vitejs-vite-tmz1b6?embed=1&file=main.js',
    },
  ];

  const [activeFramework, setActiveFramework] = useState(frameworks[0]);

  // Dynamically create the full embed URL with the correct theme
  const stackblitzEmbedUrl = `${activeFramework.url}&theme=${colorMode}`;

  return (
    <div className={`${styles.section} ${styles.sectionWhite}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Live Examples for Your Framework
          </h2>
          <p className={styles.sectionDescription}>
            Select a framework to see a live, interactive PivotHead example. No
            installation required.
          </p>
        </div>

        <div className={styles.frameworkSelector}>
          {frameworks.map(fw => (
            <button
              key={fw.name}
              onClick={() => setActiveFramework(fw)}
              className={clsx(
                styles.frameworkButton,
                activeFramework.name === fw.name && styles.activeFrameworkButton
              )}
            >
              <div className={styles.frameworkIcon}>{fw.icon}</div>
              <span>{fw.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.stackblitzContainer}>
          <iframe
            key={stackblitzEmbedUrl} // The key now includes the theme, forcing a reload on theme change
            src={stackblitzEmbedUrl}
            className={styles.stackblitzEmbed}
            title={`${activeFramework.name} Live Demo on StackBlitz`}
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

function CtaSection() {
  const { colorMode } = useColorMode();

  return (
    <div className={`${styles.section} ${styles.sectionGray}`}>
      <div className="container text--center">
        <h2
          className={clsx(
            styles.ctaTitle,
            colorMode === 'dark' ? 'text-white' : 'text-slate-900'
          )}
        >
          Ready to Transform Your Data?
        </h2>
        <p
          className={clsx(
            styles.ctaDescription,
            colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          Join the developers who trust PivotHead for their data visualization
          needs.
        </p>
        <div className={styles.heroButtons}>
          <Link
            to="/docs/Installation"
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Get Started Now <ArrowRightIcon style={{ marginLeft: '0.5rem' }} />
          </Link>
          <Link
            to=""
            className={clsx(
              styles.button,
              styles.secondaryButton,
              colorMode === 'dark'
                ? 'text-white border-slate-700 hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            )}
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title={`Interactive Data Visualization Library`}
      description="A feature-rich JavaScript pivot table library for creating interactive reports inside your app or website. Transform your raw data into meaningful insights."
    >
      <div>
        <main>
          <HeroSection />
          <WasmPerformanceShowcase />
          <ChartsVisualizationSection />
          {/* <section
            className="relative rounded-t-3xl border border-border/60 backdrop-blur overflow-hidden
        bg-[linear-gradient(to_bottom_right,_color-mix(in_oklab,var(--background),_transparent_30%),_color-mix(in_oklab,var(--background),_transparent_10%))]
        after:bg-[radial-gradient(1200px_600px_at_50%_40%,_transparent_35%,_rgba(0,0,0,0.08)_85%)]
        after:opacity-60
        before:content-[''] before:absolute before:-inset-[35%] before:pointer-events-none before:blur-[70px]
        before:opacity-55
        before:bg-[radial-gradient(700px_360px_at_20%_15%,_color-mix(in_oklab,var(--primary),_transparent),_transparent),radial-gradient(700px_360px_at_80%_20%,_color-mix(in_oklab,var(--primary),_transparent),_transparent),radial-gradient(520px_260px_at_50%_110%,_color-mix(in_oklab,var(--primary),_transparent),_transparent)]"
          > */}

          {/* <DataVisualizationSection /> */}
          <HeadlessDataVisualizationSection />
          <HomepageFeatures />
          <ModernDevelopersSection />
          {/* <StackBlitzSection /> */}
          <CtaSection />
          {/* </section> */}
        </main>
      </div>
    </Layout>
  );
}
