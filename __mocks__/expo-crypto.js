// Mock for expo-crypto — deterministic UUID generation for tests.
// Returns a predictable UUID based on an incrementing counter.

let counter = 0;

export function randomUUID() {
  counter++;
  const hex = counter.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

export function __resetCounter() {
  counter = 0;
}
