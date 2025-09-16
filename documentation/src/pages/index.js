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
          colorMode === 'dark' ? 'bg-slate-900' : 'bg-white'
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
            Trusted by 10,000+ developers worldwide
          </div>
        </div>

        {/* Main Headline */}
        <div className="animate-fade-in-up-delay mb-8 [animation-delay:200ms]">
          <h1
            className={clsx(
              'mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl',
              colorMode === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Unlock the Stories Hidden in Your Data
          </h1>
          <div className="inline-flex item-center backdrop-blur-sm">
            <span
              className={clsx(
                'text-5xl font-black sm:text-6xl lg:text-7xl mt-4',
                colorMode === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              Pivot
            </span>
            <div className="ml-0 rounded-2xl  p-4 h-24 sm:h-28 lg:h-32 w-64 sm:w-80 lg:w-60">
              <MorphingText
                texts={['Head', 'Table', 'Grid']}
                className="text-xl sm:text-6xl lg:text-7xl"
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className={clsx(
            'animate-fade-in-up-delay mx-auto mb-12 max-w-4xl text-lg leading-relaxed opacity-90 [animation-delay:400ms] sm:text-xl lg:text-2xl',
            colorMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          PivotHead is a feature-rich JavaScript pivot table library for
          creating
          <span className="font-semibold text-red-400">
            {' '}
            interactive reports
          </span>{' '}
          inside your app or website. Created by industry experts.
        </p>

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

function AnimatedPivotTableVisual() {
  const [isPivoted, setIsPivoted] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    // This will toggle the animation back and forth to keep it looping
    const interval = setInterval(() => {
      setIsPivoted(prev => !prev);
    }, 4000); // Toggles every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const rawData = [
    { product: 'Widget A', region: 'North', sales: '$1,000' },
    { product: 'Widget B', region: 'North', sales: '$1,500' },
    { product: 'Widget A', region: 'South', sales: '$1,200' },
    { product: 'Widget B', region: 'South', sales: '$1,800' },
  ];

  return (
    <div className={styles.animTableWrapper}>
      <div
        className={clsx(
          styles.animTable,
          isPivoted && styles.pivoted,
          colorMode === 'dark' && styles.darkMode
        )}
      >
        {/* Headers */}
        <div
          className={clsx(styles.animCell, styles.header, styles.productHeader)}
        >
          Product
        </div>
        <div
          className={clsx(styles.animCell, styles.header, styles.regionHeader)}
        >
          Region
        </div>
        <div
          className={clsx(styles.animCell, styles.header, styles.salesHeader)}
        >
          Sales
        </div>

        {/* Data Cells from Raw Data */}
        {rawData.map((row, index) => (
          <React.Fragment key={index}>
            <div
              className={clsx(
                styles.animCell,
                styles.productCell,
                `cell-${index}`
              )}
            >
              {row.product}
            </div>
            <div
              className={clsx(
                styles.animCell,
                styles.regionCell,
                `cell-${index}`
              )}
            >
              {row.region}
            </div>
            <div
              className={clsx(
                styles.animCell,
                styles.salesCell,
                `cell-${index}`
              )}
            >
              {row.sales}
            </div>
          </React.Fragment>
        ))}

        {/* Headers and Cells that only appear in the pivoted state */}
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.header,
            styles.northHeader
          )}
        >
          North
        </div>
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.header,
            styles.southHeader
          )}
        >
          South
        </div>
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.data,
            styles.waNorth
          )}
        >
          {' '}
          $1,000{' '}
        </div>
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.data,
            styles.waSouth
          )}
        >
          {' '}
          $1,200{' '}
        </div>
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.data,
            styles.wbNorth
          )}
        >
          {' '}
          $1,500{' '}
        </div>
        <div
          className={clsx(
            styles.animCell,
            styles.pivotedOnly,
            styles.data,
            styles.wbSouth
          )}
        >
          {' '}
          $1,800{' '}
        </div>
      </div>
    </div>
  );
}

function DataVisualizationSection() {
  const [copied, setCopied] = useState(false);
  const code = `// 1. Initialize the headless engine
const engine = new PivotEngine(config);

// 2. Get the processed data state
const state = engine.getState();

// 3. Render the state in any UI
//    framework you choose.
renderYourOwnTable(state);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${styles.section} ${styles.sectionWhite}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Powerful Visualization Core</h2>
          <p className={styles.sectionDescription}>
            Visually grasp how PivotHead instantly structures your data, then
            use the headless engine to build any interface you can imagine.
          </p>
        </div>

        <div className={`${styles.grid} ${styles.lgGridCols2} items-center`}>
          {/* Left Column: Animated Table */}
          <div className={styles.visualizationColumn}>
            <h3 className={styles.columnTitle}>See it in Action</h3>
            <AnimatedPivotTableVisual />
          </div>

          {/* Right Column: Headless Code Example */}
          <div className={styles.visualizationColumn}>
            <h3 className={styles.columnTitle}>Use it Headlessly</h3>
            <div className={styles.codeBlockContainer}>
              <div className={styles.codeBlockHeader}>
                <span>engine.js</span>
                <button
                  onClick={handleCopy}
                  className={styles.copyButton}
                  title="Copy code"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className={styles.codeBlock}>
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

// function CtaSection() {
//   const { colorMode } = useColorMode()

//   return (
//     <div className={`${styles.section} ${styles.sectionGray}`}>
//       <div className="container text--center">
//         <h2 className={clsx(styles.ctaTitle, colorMode === "dark" ? "text-white" : "text-slate-900")}>Ready to Transform Your Data?</h2>
//         <p className={clsx(styles.ctaDescription, colorMode === "dark" ? "text-slate-300" : "text-slate-600")}>Join thousands of developers who trust PivotHead for their data visualization needs.</p>
//         <div className={styles.heroButtons}>
//           <Link to="/docs/Installation" className={`${styles.button} ${styles.primaryButton}`}>
//             Get Started Now <ArrowRightIcon style={{ marginLeft: "0.5rem" }} />
//           </Link>
//           <Link to="/docs/what-is-pivothead" className={clsx(styles.button, styles.secondaryButton, colorMode === "dark" ? "text-white border-slate-700 hover:bg-slate-800" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50")}>
//             View Documentation
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

function Footer() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div>
            <div
              className={styles.logoContainer}
              style={{ marginBottom: '1rem' }}
            >
              <div className={styles.logoIconContainer}>
                <BarChartIcon />
              </div>
              <span className={styles.logoText}>{siteConfig.title}</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              The most powerful pivot table component for modern web
              applications.
            </p>
          </div>
          <div>
            <h3 className={styles.footerTitle}>Product</h3>
            <ul className={styles.footerList}>
              <li>
                <Link to="#features" className={styles.footerLink}>
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/what-is-pivothead"
                  className={styles.footerLink}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/what-is-pivothead"
                  className={styles.footerLink}
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={styles.footerTitle}>Resources</h3>
            <ul className={styles.footerList}>
              <li>
                <Link
                  to="/docs/tutorial-basics/examples"
                  className={styles.footerLink}
                >
                  Examples
                </Link>
              </li>
              <li>
                <Link
                  to="https://github.com/mindfiredigital/PivotHead"
                  className={styles.footerLink}
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={styles.footerTitle}>Company</h3>
            <ul className={styles.footerList}>
              <li>
                <Link to="#" className={styles.footerLink}>
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className={styles.footerLink}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className={styles.footerLink}>
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerCopyright}>
          © {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
          Built with ❤️ for developers.
        </div>
      </div>
    </footer>
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
          <DataVisualizationSection />
          <HomepageFeatures />
          <ModernDevelopersSection />
          <StackBlitzSection />
          {/* <CtaSection /> */}
        </main>
        <Footer />
      </div>
    </Layout>
  );
}
