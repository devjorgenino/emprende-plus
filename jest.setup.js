// Jest global setup for EmprendePlus
// Registers mocks for native modules that are not available in the Node test env.

jest.mock('expo-sqlite');
jest.mock('expo-crypto');

// jest-expo provides its own automock for expo-file-system and expo-sharing,
// so we override with explicit factories that let tests inspect writes/shares.
jest.mock('expo-file-system', () => {
  const written = {};
  let lastWrite = null;
  return {
    cacheDirectory: '/mock-cache/',
    EncodingType: { UTF8: 'utf8' },
    writeAsStringAsync: jest.fn(async (uri, content) => {
      written[uri] = { content };
      lastWrite = { uri, content };
    }),
    readAsStringAsync: jest.fn(async (uri) => (written[uri] ? written[uri].content : '')),
    __getWritten: (uri) => written[uri] || null,
    __getLastWrite: () => lastWrite,
    __clearWritten: () => {
      Object.keys(written).forEach((k) => delete written[k]);
      lastWrite = null;
    },
  };
});

jest.mock('expo-sharing', () => {
  let available = true;
  let lastShareArgs = null;
  return {
    isAvailableAsync: jest.fn(async () => available),
    shareAsync: jest.fn(async (uri, options) => {
      lastShareArgs = { uri, options };
    }),
    __setAvailable: (v) => {
      available = v;
    },
    __getLastShareArgs: () => lastShareArgs,
    __reset: () => {
      available = true;
      lastShareArgs = null;
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);