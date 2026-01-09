/**
 * WASM Asset Helper
 *
 * This file provides the WASM URL in a bundler-friendly way.
 * For library builds, we compute the path at runtime based on where this file is located.
 *
 * Supports both browser and Node.js environments:
 * - Browser: Uses import.meta.url and fetch()
 * - Node.js: Uses __dirname and fs.readFileSync()
 */

/**
 * Check if running in Node.js environment
 */
function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Get the WASM file path for Node.js
 */
function getNodeWasmPath(): string {
  // In Node.js, use __dirname or module resolution
  // This works because this file is built to dist and csvParser.wasm is in dist/wasm

  try {
    // Try to resolve relative to this module
    if (typeof __dirname !== 'undefined') {
      const path = require('path');
      // __dirname will be the dist directory (since UMD bundles everything)
      // WASM file is in dist/wasm/csvParser.wasm
      const wasmPath = path.join(__dirname, 'wasm', 'csvParser.wasm');
      return wasmPath;
    }
  } catch (error) {
    console.warn('Could not resolve __dirname:', error);
  }

  // Fallback: try relative paths
  return './dist/wasm/csvParser.wasm';
}

/**
 * Get the URL to the WASM file
 * Returns a path relative to the consuming application
 */
export function getWasmUrl(): string {
  // Node.js environment
  if (isNode()) {
    return getNodeWasmPath();
  }

  // Browser environment
  try {
    // Try to use import.meta.url to get the base path
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      // Get the directory where this file is located
      const baseUrl = import.meta.url;
      const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/'));

      // csvParser.wasm is in the same directory as this file in the dist
      const wasmUrl = `${basePath}/csvParser.wasm`;
      console.log(`Computed WASM URL: ${wasmUrl}`);
      return wasmUrl;
    }
  } catch (error) {
    console.warn('import.meta.url not available:', error);
  }

  // Fallback: try common paths
  console.warn('Using fallback WASM path');
  // Try public directory first (for simple demos)
  return '/wasm/csvParser.wasm';
}

/**
 * Validate WASM magic number
 */
function isValidWasm(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x61 &&
    bytes[2] === 0x73 &&
    bytes[3] === 0x6d
  );
}

/**
 * Load WASM binary in Node.js environment
 */
function loadWasmNode(filePath: string): ArrayBuffer {
  const fs = require('fs');
  const path = require('path');

  // Try multiple possible paths
  const possiblePaths = [
    filePath,
    path.resolve(filePath),
    path.join(__dirname, 'wasm', 'csvParser.wasm'), // For UMD build: dist/wasm/csvParser.wasm
    path.join(__dirname, 'csvParser.wasm'), // For ESM build in wasm dir
    path.join(__dirname, '../wasm/csvParser.wasm'), // One level up
    path.join(
      process.cwd(),
      'node_modules/@mindfiredigital/pivothead/dist/wasm/csvParser.wasm'
    ),
  ];

  for (const tryPath of possiblePaths) {
    try {
      if (fs.existsSync(tryPath)) {
        console.log(`✅ Loading WASM from: ${tryPath}`);
        const buffer = fs.readFileSync(tryPath);

        // Convert Node.js Buffer to ArrayBuffer properly
        // We need to create a new ArrayBuffer and copy the data
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
        const bytes = new Uint8Array(arrayBuffer);

        if (isValidWasm(bytes)) {
          return arrayBuffer;
        } else {
          console.warn(`Invalid WASM file at ${tryPath}`);
        }
      }
    } catch (error) {
      // Continue to next path
    }
  }

  throw new Error(
    `WASM file not found. Tried paths:\n${possiblePaths.join('\n')}\n\nMake sure the package is properly installed.`
  );
}

/**
 * Fetch and return the WASM binary
 */
export async function fetchWasmBinary(): Promise<ArrayBuffer> {
  const url = getWasmUrl();

  // Node.js environment - use fs.readFileSync
  if (isNode()) {
    try {
      return loadWasmNode(url);
    } catch (error) {
      console.error('Failed to load WASM in Node.js:', error);
      throw error;
    }
  }

  // Browser environment - use fetch
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Validate that we got a WASM file, not an HTML error page
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (isValidWasm(bytes)) {
      return buffer;
    } else {
      // Check if it's an HTML error page
      const textStart = String.fromCharCode(...bytes.slice(0, 4));
      if (textStart === '<!DO' || textStart === '<htm') {
        throw new Error(
          `Received HTML instead of WASM binary from ${url} - likely a 404 error`
        );
      }
      throw new Error(`Invalid WASM file format from ${url}`);
    }
  } catch (primaryError) {
    console.warn(`Failed to fetch WASM from ${url}:`, primaryError);

    // Try fallback URLs
    const fallbackUrls = [
      '/wasm/csvParser.wasm',
      '/node_modules/@mindfiredigital/pivothead/dist/wasm/csvParser.wasm',
    ];

    for (const fallbackUrl of fallbackUrls) {
      if (fallbackUrl === url) continue; // Skip if it's the same as primary

      try {
        console.log(`Trying fallback URL: ${fallbackUrl}`);
        const response = await fetch(fallbackUrl);
        if (!response.ok) continue;

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        if (isValidWasm(bytes)) {
          console.log(
            `✅ Successfully loaded WASM from fallback: ${fallbackUrl}`
          );
          return buffer;
        }
      } catch (error) {
        console.warn(`Fallback ${fallbackUrl} failed:`, error);
      }
    }

    throw new Error(
      `Failed to fetch WASM from ${url} and all fallback URLs. Make sure to run 'pnpm build:wasm' in the core package.`
    );
  }
}
