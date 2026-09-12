/* eslint-disable no-undef */
// Jest setup for native modules

// Mock virtual @env module
jest.mock('@env', () => ({
    API_URL: 'https://study-app-backend-production.up.railway.app',
}), { virtual: true });

// Mock react-native-keychain
const mockKeychainStorage: Record<string, string> = {};
jest.mock('react-native-keychain', () => ({
    SECURITY_LEVEL: { SECURE_HARDWARE: 'SECURE_HARDWARE' },
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' },
    setGenericPassword: jest.fn(async (username, password, options) => {
        const service = options?.service || 'default';
        mockKeychainStorage[service] = JSON.stringify({ username, password });
        return true;
    }),
    getGenericPassword: jest.fn(async (options) => {
        const service = options?.service || 'default';
        const data = mockKeychainStorage[service];
        return data ? JSON.parse(data) : false;
    }),
    resetGenericPassword: jest.fn(async (options) => {
        const service = options?.service || 'default';
        delete mockKeychainStorage[service];
        return true;
    }),
    __clearMockStorage: () => {
        Object.keys(mockKeychainStorage).forEach((k) => delete mockKeychainStorage[k]);
    },
}));

// Mock react-native-fs
const mockFsFiles: Record<string, string> = {};
jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/documents',
    exists: jest.fn(async (path: string) => !!mockFsFiles[path]),
    readFile: jest.fn(async (path: string) => mockFsFiles[path] || ''),
    writeFile: jest.fn(async (path: string, content: string) => {
        mockFsFiles[path] = content;
    }),
    unlink: jest.fn(async (path: string) => {
        delete mockFsFiles[path];
    }),
    __setMockFile: (path: string, content: string) => {
        mockFsFiles[path] = content;
    },
    __clearMockFs: () => {
        Object.keys(mockFsFiles).forEach((k) => delete mockFsFiles[k]);
    },
}));
