import RNFS from 'react-native-fs';
import {
    saveSecureSession,
    loadSecureSession,
    clearSecureSession,
    getSecureAccessToken,
    getSecureRefreshToken,
    StoredSession,
} from './secureStorage';

const REMEMBER_ME_PATH = `${RNFS.DocumentDirectoryPath}/remember_me.json`;

/**
 * Saves auth token and user to secure storage (Keychain/Keystore)
 */
export const saveAuthSession = async (
    token: string,
    user: any,
    refreshToken?: string | null
): Promise<void> => {
    await saveSecureSession(token, user, refreshToken);
};

/**
 * Loads session from secure storage (Keychain/Keystore)
 */
export const loadAuthSession = async (): Promise<{ token: string; user: any; refreshToken?: string | null } | null> => {
    const session: StoredSession | null = await loadSecureSession();
    if (session && session.tokens?.accessToken) {
        return {
            token: session.tokens.accessToken,
            refreshToken: session.tokens.refreshToken,
            user: session.user,
        };
    }
    return null;
};

/**
 * Clears all auth sessions from secure storage
 */
export const clearAuthSession = async (): Promise<void> => {
    await clearSecureSession();
};

export { getSecureAccessToken, getSecureRefreshToken };

/**
 * Remembers email address only (no tokens, no passwords)
 */
export const saveRememberedEmail = async (email: string): Promise<void> => {
    try {
        await RNFS.writeFile(REMEMBER_ME_PATH, JSON.stringify({ email: email.trim().toLowerCase() }), 'utf8');
    } catch {
        console.warn('Failed to persist remembered email preference');
    }
};

export const loadRememberedEmail = async (): Promise<string | null> => {
    try {
        if (await RNFS.exists(REMEMBER_ME_PATH)) {
            const content = await RNFS.readFile(REMEMBER_ME_PATH, 'utf8');
            const data = JSON.parse(content);
            return data.email || null;
        }
    } catch {
        console.warn('Failed to load remembered email preference');
    }
    return null;
};

export const clearRememberedEmail = async (): Promise<void> => {
    try {
        if (await RNFS.exists(REMEMBER_ME_PATH)) {
            await RNFS.unlink(REMEMBER_ME_PATH);
        }
    } catch {
        console.warn('Failed to clear remembered email preference');
    }
};
