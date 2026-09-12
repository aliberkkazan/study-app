import {
    saveSecureSession,
    loadSecureSession,
    clearSecureSession,
    cleanupLegacySessionFile,
} from '../../src/utils/secureStorage';
import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs';

describe('Secure Storage & Token Management', () => {
    beforeEach(async () => {
        (Keychain as any).__clearMockStorage?.();
        (RNFS as any).__clearMockFs?.();
        await clearSecureSession();
    });

    it('should securely save and load tokens from Keychain', async () => {
        const testUser = { id: 'usr-123', name: 'Student One', role: 'student' };
        await saveSecureSession('access-token-abc', testUser, 'refresh-token-xyz');

        const loaded = await loadSecureSession();
        expect(loaded).not.toBeNull();
        expect(loaded?.tokens?.accessToken).toBe('access-token-abc');
        expect(loaded?.tokens?.refreshToken).toBe('refresh-token-xyz');
        expect(loaded?.user?.id).toBe('usr-123');
    });

    it('should completely wipe tokens on clearSecureSession (logout/deletion)', async () => {
        await saveSecureSession('token-to-delete', { id: 'usr-456' });
        await clearSecureSession();

        const loaded = await loadSecureSession();
        expect(loaded).toBeNull();
    });

    it('should detect, migrate, and delete unencrypted legacy session file', async () => {
        const legacyPath = `${RNFS.DocumentDirectoryPath}/auth_session.json`;
        const legacyPayload = JSON.stringify({
            token: 'legacy-token-999',
            user: { id: 'legacy-user', name: 'Legacy' },
        });
        (RNFS as any).__setMockFile(legacyPath, legacyPayload);

        expect(await RNFS.exists(legacyPath)).toBe(true);

        const loaded = await loadSecureSession();
        expect(loaded?.tokens?.accessToken).toBe('legacy-token-999');

        // Verify the unencrypted file was unlinked from disk
        const stillExists = await RNFS.exists(legacyPath);
        expect(stillExists).toBe(false);
    });

    it('should fall back gracefully to memory session if Keychain fails', async () => {
        const originalSetGenericPassword = Keychain.setGenericPassword;
        (Keychain as any).setGenericPassword = jest.fn().mockRejectedValue(new Error('Secure hardware failure'));

        // Should not throw
        await saveSecureSession('fallback-token', { id: 'fallback-user' });

        (Keychain as any).getGenericPassword = jest.fn().mockRejectedValue(new Error('Keychain unavailable'));
        const loaded = await loadSecureSession();

        expect(loaded?.tokens?.accessToken).toBe('fallback-token');
        (Keychain as any).setGenericPassword = originalSetGenericPassword;
    });
});
