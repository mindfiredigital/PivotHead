async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(
            `${message} in ${fileName}:${lineNumber}:${columnNumber}`
          );
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf(
    {
      getLastErrorMessage() {
        // assembly/csvParser/getLastErrorMessage() => ~lib/string/String
        return __liftString(exports.getLastErrorMessage() >>> 0);
      },
      parseCSVChunk(input, delimiter, hasHeader, trimValues) {
        // assembly/csvParser/parseCSVChunk(~lib/string/String, i32?, bool?, bool?) => i32
        input = __lowerString(input) || __notnull();
        hasHeader = hasHeader ? 1 : 0;
        trimValues = trimValues ? 1 : 0;
        exports.__setArgumentsLength(arguments.length);
        return exports.parseCSVChunk(input, delimiter, hasHeader, trimValues);
      },
      extractField(input, start, end, trimValues) {
        // assembly/csvParser/extractField(~lib/string/String, i32, i32, bool) => ~lib/string/String
        input = __lowerString(input) || __notnull();
        trimValues = trimValues ? 1 : 0;
        return __liftString(
          exports.extractField(input, start, end, trimValues) >>> 0
        );
      },
      parseNumber(input) {
        // assembly/csvParser/parseNumber(~lib/string/String) => f64
        input = __lowerString(input) || __notnull();
        return exports.parseNumber(input);
      },
      detectFieldType(value) {
        // assembly/csvParser/detectFieldType(~lib/string/String) => i32
        value = __lowerString(value) || __notnull();
        return exports.detectFieldType(value);
      },
      getVersion() {
        // assembly/csvParser/getVersion() => ~lib/string/String
        return __liftString(exports.getVersion() >>> 0);
      },
      benchmark(input) {
        // assembly/csvParser/benchmark(~lib/string/String) => f64
        input = __lowerString(input) || __notnull();
        return exports.benchmark(input);
      },
    },
    exports
  );
  function __liftString(pointer) {
    if (!pointer) return null;
    const end =
        (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let start = pointer >>> 1,
      string = '';
    while (end - start > 1024)
      string += String.fromCharCode(
        ...memoryU16.subarray(start, (start += 1024))
      );
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i)
      memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __notnull() {
    throw TypeError('value must not be null');
  }
  return adaptedExports;
}
export const {
  memory,
  __new,
  __pin,
  __unpin,
  __collect,
  __rtti_base,
  getLastRowCount,
  getLastColCount,
  getLastErrorCode,
  getLastErrorMessage,
  parseCSVChunk,
  extractField,
  parseNumber,
  detectFieldType,
  estimateMemory,
  initialize,
  getVersion,
  benchmark,
} = await (async url =>
  instantiate(
    await (async () => {
      const isNodeOrBun =
        typeof process != 'undefined' &&
        process.versions != null &&
        (process.versions.node != null || process.versions.bun != null);
      if (isNodeOrBun) {
        return globalThis.WebAssembly.compile(
          await (await import('node:fs/promises')).readFile(url)
        );
      } else {
        return await globalThis.WebAssembly.compileStreaming(
          globalThis.fetch(url)
        );
      }
    })(),
    {}
  ))(new URL('csvParser.wasm', import.meta.url));
