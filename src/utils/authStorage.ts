import RNFS from 'react-native-fs';

const AUTH_FILE_PATH = RNFS.DocumentDirectoryPath + '/auth_session.json';

export const saveAuthSession = async (token: string, user: any) => {
    try {
        await RNFS.writeFile(AUTH_FILE_PATH, JSON.stringify({ token, user }), 'utf8');
    } catch (error) {
        console.error('Failed to save auth session', error);
    }
};

export const loadAuthSession = async () => {
    try {
        if (await RNFS.exists(AUTH_FILE_PATH)) {
            const content = await RNFS.readFile(AUTH_FILE_PATH, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Failed to load auth session', error);
    }
    return null;
};

export const clearAuthSession = async () => {
    try {
        if (await RNFS.exists(AUTH_FILE_PATH)) {
            await RNFS.unlink(AUTH_FILE_PATH);
        }
    } catch (error) {
        console.error('Failed to clear auth session', error);
    }
};
