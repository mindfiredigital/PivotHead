#!/usr/bin/env node
/**
 * @mindfiredigital/pivothead-analytics — Postinstall Setup
 *
 * Interactively installs your preferred charting library when this package is
 * installed. Runs automatically via npm/pnpm/yarn postinstall hook.
 *
 * Set PIVOTHEAD_SKIP_SETUP=true to skip this prompt entirely.
 */

import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// ─── Library catalogue ────────────────────────────────────────────────────────

const LIBRARIES = [
  {
    id: 'chartjs',
    name: 'Chart.js',
    package: 'chart.js',
    version: '^4.4.3',
    description: 'Lightweight, easy to use, browser-first charting',
  },
  {
    id: 'echarts',
    name: 'Apache ECharts',
    package: 'echarts',
    version: '^5.5.0',
    description: 'Feature-rich, interactive charts for complex data',
  },
  {
    id: 'plotly',
    name: 'Plotly.js',
    package: 'plotly.js-dist',
    version: '^2.30.0',
    description: 'Scientific & statistical charts, great for data science',
  },
  {
    id: 'd3',
    name: 'D3.js',
    package: 'd3',
    version: '^7.9.0',
    description: 'Maximum flexibility with custom SVG-based rendering',
  },
];

// ─── Terminal colours (only when connected to a real TTY) ─────────────────────

const isTTY = Boolean(process.stdout.isTTY);
const c = isTTY
  ? {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
    }
  : {
      reset: '',
      bold: '',
      dim: '',
      cyan: '',
      green: '',
      yellow: '',
      red: '',
    };

// ─── Package manager detection ────────────────────────────────────────────────

function detectPackageManager() {
  const root = getProjectRoot();

  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(root, 'bun.lockb'))) return 'bun';
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn';

  const execPath = process.env.npm_execpath ?? '';
  if (execPath.includes('pnpm')) return 'pnpm';
  if (execPath.includes('yarn')) return 'yarn';

  const userAgent = process.env.npm_config_user_agent ?? '';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('bun')) return 'bun';

  return 'npm';
}

function buildInstallCommand(pm, packages) {
  const root = getProjectRoot();
  // Workspace roots require an explicit flag to allow adding deps there
  // (pnpm: -w, yarn: -W, npm: -w). Normal projects never have these files.
  const isWorkspaceRoot =
    existsSync(join(root, 'pnpm-workspace.yaml')) ||
    existsSync(join(root, 'lerna.json'));

  switch (pm) {
    case 'pnpm': return `pnpm add ${isWorkspaceRoot ? '-w ' : ''}${packages.join(' ')}`;
    case 'yarn': return `yarn add ${isWorkspaceRoot ? '-W ' : ''}${packages.join(' ')}`;
    case 'bun':  return `bun add ${packages.join(' ')}`;
    default:     return `npm install ${isWorkspaceRoot ? '-w ' : ''}${packages.join(' ')}`;
  }
}

// ─── Project root (where the consuming project's package.json lives) ──────────

function getProjectRoot() {
  return (
    process.env.INIT_CWD ??
    process.env.npm_config_local_prefix ??
    process.cwd()
  );
}

// ─── Persist selection to a config file ──────────────────────────────────────

function writeConfig(primaryLibraryId, allSelected) {
  try {
    const configPath = join(getProjectRoot(), '.pivothead-analytics.json');
    const payload = JSON.stringify(
      {
        library: primaryLibraryId,
        installedLibraries: allSelected,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    );
    writeFileSync(configPath, payload + '\n', 'utf8');
    return configPath;
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Allow users to opt out entirely
  if (process.env.PIVOTHEAD_SKIP_SETUP === 'true') return;

  // Non-interactive environments (CI/CD, piped installs, etc.)
  if (!process.stdin.isTTY) {
    console.log(
      '\n' +
        c.yellow +
        c.bold +
        '  @mindfiredigital/pivothead-analytics' +
        c.reset +
        '\n' +
        c.dim +
        '  Non-interactive install detected. Charting library not selected.' +
        '\n' +
        '  Install one manually, then set PIVOTHEAD_LIBRARY:<version>' +
        '\n' +
        '\n' +
        '    npm install chart.js          PIVOTHEAD_LIBRARY=chartjs' +
        '\n' +
        '    npm install echarts            PIVOTHEAD_LIBRARY=echarts' +
        '\n' +
        '    npm install plotly.js-dist     PIVOTHEAD_LIBRARY=plotly' +
        '\n' +
        '    npm install d3                 PIVOTHEAD_LIBRARY=d3' +
        c.reset +
        '\n'
    );
    return;
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  console.log(
    '\n' +
      c.cyan +
      c.bold +
      '  ┌──────────────────────────────────────────────────────┐\n' +
      '  │   @mindfiredigital/pivothead-analytics  Setup        │\n' +
      '  └──────────────────────────────────────────────────────┘' +
      c.reset
  );
  console.log(
    '\n  Which charting library would you like to install?\n'
  );

  LIBRARIES.forEach((lib, i) => {
    const idx  = c.cyan + c.bold + `  [${i + 1}]` + c.reset;
    const name = c.bold + lib.name.padEnd(18) + c.reset;
    const desc = c.dim + lib.description + c.reset;
    console.log(`${idx} ${name} ${desc}`);
  });

  console.log(
    '\n' +
      c.dim +
      '  Enter number(s) separated by commas (e.g. 1 or 1,3),' +
      '\n' +
      '  or press Enter to skip and install manually later.' +
      c.reset
  );

  // ── Prompt ──────────────────────────────────────────────────────────────────
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => {
    rl.question(c.cyan + '\n  > ' + c.reset, ans => {
      rl.close();
      resolve(ans.trim());
    });
  });

  if (!answer) {
    console.log(
      '\n' +
        c.yellow +
        '  Skipped. Install a library later, e.g.:' +
        '\n' +
        c.dim +
        '    npm install chart.js' +
        c.reset +
        '\n'
    );
    return;
  }

  // ── Parse selection ──────────────────────────────────────────────────────────
  const indices = answer
    .split(',')
    .map(s => parseInt(s.trim(), 10) - 1)
    .filter(i => i >= 0 && i < LIBRARIES.length);

  if (indices.length === 0) {
    console.log('\n' + c.yellow + '  No valid selection. Skipping.\n' + c.reset);
    return;
  }

  const selected  = indices.map(i => LIBRARIES[i]);
  const pm        = detectPackageManager();
  const packages  = selected.map(l => l.package);
  const names     = selected.map(l => l.name).join(', ');

  console.log(
    '\n' +
      c.green +
      `  Installing ${names} via ${pm}…` +
      c.reset +
      '\n'
  );

  // ── Install ──────────────────────────────────────────────────────────────────
  try {
    const cmd = buildInstallCommand(pm, packages);
    execSync(cmd, { cwd: getProjectRoot(), stdio: 'inherit' });

    // Persist the user's selection so ChartEngine can auto-detect it at runtime
    const configPath = writeConfig(
      selected[0].id,
      selected.map(l => l.id)
    );

    console.log(
      '\n' + c.green + c.bold + '  ✔  Done!' + c.reset
    );
    if (configPath) {
      console.log(
        c.dim + `  Config written to ${configPath}` + c.reset
      );
    }

    const usageSnippets = {
      chartjs:
        `  import { Chart, registerables } from 'chart.js';\n` +
        `  import { ChartEngine } from '@mindfiredigital/pivothead-analytics';\n\n` +
        `  Chart.register(...registerables);\n` +
        `  const chartEngine = new ChartEngine(pivotEngine, { chartInstance: Chart });\n` +
        `  chartEngine.bar({ container: '#chart' });`,
      echarts:
        `  import * as echarts from 'echarts';\n` +
        `  import { ChartEngine } from '@mindfiredigital/pivothead-analytics';\n\n` +
        `  const chartEngine = new ChartEngine(pivotEngine, { echartsInstance: echarts });\n` +
        `  chartEngine.bar({ container: '#chart' });`,
      plotly:
        `  import Plotly from 'plotly.js-dist';\n` +
        `  import { ChartEngine } from '@mindfiredigital/pivothead-analytics';\n\n` +
        `  const chartEngine = new ChartEngine(pivotEngine, { plotlyInstance: Plotly });\n` +
        `  chartEngine.bar({ container: '#chart' });`,
      d3:
        `  import * as d3 from 'd3';\n` +
        `  import { ChartEngine } from '@mindfiredigital/pivothead-analytics';\n\n` +
        `  const chartEngine = new ChartEngine(pivotEngine, { d3Instance: d3 });\n` +
        `  chartEngine.bar({ container: '#chart' });`,
    };

    const snippet = usageSnippets[selected[0].id] ?? usageSnippets['chartjs'];

    console.log(
      '\n  Usage in your project (Vite / webpack / any bundler):\n\n' +
        c.cyan +
        snippet +
        c.reset +
        '\n'
    );
  } catch (err) {
    console.error(
      '\n' + c.red + '  ✖  Installation failed:' + c.reset,
      err?.message ?? err
    );
    const fallback = buildInstallCommand(pm, packages);
    console.log(
      c.yellow +
        `  Try manually: ${fallback}` +
        c.reset +
        '\n'
    );
    // Exit with 0 so the parent install is not blocked
    process.exit(0);
  }
}

main().catch(err => {
  // Never block the parent package install
  console.error(
    c.red + '  Warning: pivothead-analytics setup encountered an error:' + c.reset,
    err?.message ?? err
  );
  process.exit(0);
});
