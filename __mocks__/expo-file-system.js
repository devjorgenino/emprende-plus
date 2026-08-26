// Mock for expo-file-system used in tests.
// csv.ts uses `import * as FileSystem` so we need named exports.

export const cacheDirectory = '/mock-cache/';

export const EncodingType = { UTF8: 'utf8' };

const written = {};
let lastWrite = null;

export async function writeAsStringAsync(uri, content, options) {
  written[uri] = { content, options };
  lastWrite = { uri, content, options };
}

export async function readAsStringAsync(uri) {
  return written[uri] ? written[uri].content : '';
}

export function __getWritten(uri) {
  return written[uri] || null;
}

export function __getLastWrite() {
  return lastWrite;
}

export function __clearWritten() {
  Object.keys(written).forEach((k) => delete written[k]);
  lastWrite = null;
}