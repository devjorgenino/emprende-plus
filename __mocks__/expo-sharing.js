// Mock for expo-sharing used in tests.
let available = true;
let lastShareArgs = null;

async function isAvailableAsync() {
  return available;
}

async function shareAsync(uri, options) {
  lastShareArgs = { uri, options };
  return Promise.resolve();
}

export function __setAvailable(v) {
  available = v;
}

export function __getLastShareArgs() {
  return lastShareArgs;
}

export function __reset() {
  available = true;
  lastShareArgs = null;
}
