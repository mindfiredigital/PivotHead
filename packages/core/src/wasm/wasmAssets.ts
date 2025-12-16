/**
 * WASM Asset Helper
 *
 * This file provides the WASM URL in a bundler-friendly way.
 * For library builds, we compute the path at runtime based on where this file is located.
 *
 * How it works:
 * 1. This file is built to dist/wasm/wasmAssets.js
 * 2. The WASM file is in dist/wasm/csvParser.wasm
 * 3. We construct the URL dynamically at runtime
 */

/**
 * Get the URL to the WASM file
 * Returns a path relative to the consuming application
 */
export function getWasmUrl(): string {
  // For library builds consumed by other apps, we need to construct the path
  // at runtime. The consuming app's bundler will handle resolving this.

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
 * Fetch and return the WASM binary
 */
export async function fetchWasmBinary(): Promise<ArrayBuffer> {
  const url = getWasmUrl();

  // Try primary URL first
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Validate that we got a WASM file, not an HTML error page
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for WASM magic number: 0x00 0x61 0x73 0x6d
    if (
      bytes.length >= 4 &&
      bytes[0] === 0x00 &&
      bytes[1] === 0x61 &&
      bytes[2] === 0x73 &&
      bytes[3] === 0x6d
    ) {
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

        // Validate WASM magic number
        if (
          bytes.length >= 4 &&
          bytes[0] === 0x00 &&
          bytes[1] === 0x61 &&
          bytes[2] === 0x73 &&
          bytes[3] === 0x6d
        ) {
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
