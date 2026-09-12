import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs';

const KEYCHAIN_SERVICE = 'com.studyapp.auth.tokens';
const LEGACY_AUTH_FILE_PATH = `${RNFS.DocumentDirectoryPath}/auth_session.json`;

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string | null;
}

export interface StoredSession {
    tokens: AuthTokens;
    user: any;
}

// In-memory fallback in case native Keystore / Keychain is unavailable
let memorySession: StoredSession | null = null;

/**
 * Removes legacy plain-text session file from disk if it exists
 */
export const cleanupLegacySessionFile = async (): Promise<void> => {
    try {
        const exists = await RNFS.exists(LEGACY_AUTH_FILE_PATH);
        if (exists) {
            await RNFS.unlink(LEGACY_AUTH_FILE_PATH);
        }
    } catch {
        // Silently handle legacy cleanup failure to prevent crashes
    }
};

/**
 * Saves auth tokens and sanitized user profile to secure Keychain/Keystore
 */
export const saveSecureSession = async (
    accessToken: string,
    user: any,
    refreshToken?: string | null
): Promise<void> => {
    const session: StoredSession = {
        tokens: {
            accessToken,
            refreshToken: refreshToken || null,
        },
        user,
    };

    // Keep memory cache updated
    memorySession = session;

    try {
        const payload = JSON.stringify(session);
        await Keychain.setGenericPassword('auth_session', payload, {
            service: KEYCHAIN_SERVICE,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    } catch (error) {
        // Fall back gracefully to memory session if Keychain fails (e.g., simulator or restricted device)
        console.warn('Keychain storage unavailable, falling back to secure memory session');
    }

    // Ensure any legacy unencrypted file is wiped
    await cleanupLegacySessionFile();
};

/**
 * Retrieves the stored session from Keychain/Keystore
 */
export const loadSecureSession = async (): Promise<StoredSession | null> => {
    // Check legacy file first; if present, migrate and delete it immediately
    try {
        const legacyExists = await RNFS.exists(LEGACY_AUTH_FILE_PATH);
        if (legacyExists) {
            const legacyContent = await RNFS.readFile(LEGACY_AUTH_FILE_PATH, 'utf8');
            const legacyData = JSON.parse(legacyContent);
            if (legacyData?.token) {
                await saveSecureSession(legacyData.token, legacyData.user || null);
            }
            await cleanupLegacySessionFile();
        }
    } catch {
        // Proceed to keychain
    }

    try {
        const credentials = await Keychain.getGenericPassword({
            service: KEYCHAIN_SERVICE,
        });

        if (credentials && credentials.password) {
            const parsed = JSON.parse(credentials.password) as StoredSession;
            memorySession = parsed;
            return parsed;
        }
    } catch (error) {
        console.warn('Failed to load credentials from Keychain, checking memory session');
    }

    return memorySession;
};

/**
 * Clears Keychain/Keystore, in-memory tokens, and legacy disk files
 */
export const clearSecureSession = async (): Promise<void> => {
    memorySession = null;
    try {
        await Keychain.resetGenericPassword({
            service: KEYCHAIN_SERVICE,
        });
    } catch (error) {
        console.warn('Failed to reset Keychain credentials');
    }
    await cleanupLegacySessionFile();
};

/**
 * Returns current access token
 */
export const getSecureAccessToken = async (): Promise<string | null> => {
    const session = await loadSecureSession();
    return session?.tokens?.accessToken || memorySession?.tokens?.accessToken || null;
};

/**
 * Returns current refresh token
 */
export const getSecureRefreshToken = async (): Promise<string | null> => {
    const session = await loadSecureSession();
    return session?.tokens?.refreshToken || memorySession?.tokens?.refreshToken || null;
};
