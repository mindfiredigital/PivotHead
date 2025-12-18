/** Exported memory */
export declare const memory: WebAssembly.Memory;
// Exported runtime interface
export declare function __new(size: number, id: number): number;
export declare function __pin(ptr: number): number;
export declare function __unpin(ptr: number): void;
export declare function __collect(): void;
export declare const __rtti_base: number;
/**
 * assembly/csvParser/getLastRowCount
 * @returns `f64`
 */
export declare function getLastRowCount(): number;
/**
 * assembly/csvParser/getLastColCount
 * @returns `f64`
 */
export declare function getLastColCount(): number;
/**
 * assembly/csvParser/getLastErrorCode
 * @returns `f64`
 */
export declare function getLastErrorCode(): number;
/**
 * assembly/csvParser/getLastErrorMessage
 * @returns `~lib/string/String`
 */
export declare function getLastErrorMessage(): string;
/**
 * assembly/csvParser/parseCSVChunk
 * @param input `~lib/string/String`
 * @param delimiter `f64`
 * @param hasHeader `bool`
 * @param trimValues `bool`
 * @returns `f64`
 */
export declare function parseCSVChunk(
  input: string,
  delimiter?: number,
  hasHeader?: boolean,
  trimValues?: boolean
): number;
/**
 * assembly/csvParser/extractField
 * @param input `~lib/string/String`
 * @param start `f64`
 * @param end `f64`
 * @param trimValues `bool`
 * @returns `~lib/string/String`
 */
export declare function extractField(
  input: string,
  start: number,
  end: number,
  trimValues: boolean
): string;
/**
 * assembly/csvParser/parseNumber
 * @param input `~lib/string/String`
 * @returns `f64`
 */
export declare function parseNumber(input: string): number;
/**
 * assembly/csvParser/detectFieldType
 * @param value `~lib/string/String`
 * @returns `f64`
 */
export declare function detectFieldType(value: string): number;
/**
 * assembly/csvParser/estimateMemory
 * @param rowCount `f64`
 * @param colCount `f64`
 * @returns `f64`
 */
export declare function estimateMemory(
  rowCount: number,
  colCount: number
): number;
/**
 * assembly/csvParser/initialize
 */
export declare function initialize(): void;
/**
 * assembly/csvParser/getVersion
 * @returns `~lib/string/String`
 */
export declare function getVersion(): string;
/**
 * assembly/csvParser/benchmark
 * @param input `~lib/string/String`
 * @returns `f64`
 */
export declare function benchmark(input: string): number;
