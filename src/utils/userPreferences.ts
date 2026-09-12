import RNFS from 'react-native-fs';

interface UserPreferences {
    onboardingCompleted?: boolean;
    roleSelected?: boolean;
    roleSwitched?: boolean;
}

const getPrefFilePath = (userId: string) => {
    return `${RNFS.DocumentDirectoryPath}/user_prefs_${userId}.json`;
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
    try {
        const path = getPrefFilePath(userId);
        if (await RNFS.exists(path)) {
            const content = await RNFS.readFile(path, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Failed to read user preferences from storage:', error);
    }
    return {};
};

export const saveUserPreferences = async (userId: string, prefs: Partial<UserPreferences>): Promise<void> => {
    try {
        const path = getPrefFilePath(userId);
        const current = await getUserPreferences(userId);
        const updated = { ...current, ...prefs };
        await RNFS.writeFile(path, JSON.stringify(updated), 'utf8');
    } catch (error) {
        console.error('Failed to save user preferences to storage:', error);
    }
};

export const isOnboardingCompleted = async (userId: string): Promise<boolean> => {
    const prefs = await getUserPreferences(userId);
    return !!prefs.onboardingCompleted;
};

export const setOnboardingCompleted = async (userId: string): Promise<void> => {
    await saveUserPreferences(userId, { onboardingCompleted: true });
};

export const isRoleSwitchUsed = async (userId: string): Promise<boolean> => {
    const prefs = await getUserPreferences(userId);
    return !!prefs.roleSwitched;
};

export const setRoleSwitchUsed = async (userId: string): Promise<void> => {
    await saveUserPreferences(userId, { roleSwitched: true, roleSelected: true });
};

const GLOBAL_SETTINGS_FILE = `${RNFS.DocumentDirectoryPath}/app_settings.json`;

export const getSavedLanguage = async (): Promise<'en' | 'tr' | null> => {
    try {
        if (await RNFS.exists(GLOBAL_SETTINGS_FILE)) {
            const content = await RNFS.readFile(GLOBAL_SETTINGS_FILE, 'utf8');
            const data = JSON.parse(content);
            return data.language || null;
        }
    } catch (error) {
        console.error('Failed to read saved language:', error);
    }
    return null;
};

export const saveLanguagePreference = async (language: 'en' | 'tr'): Promise<void> => {
    try {
        let current: any = {};
        if (await RNFS.exists(GLOBAL_SETTINGS_FILE)) {
            const content = await RNFS.readFile(GLOBAL_SETTINGS_FILE, 'utf8');
            current = JSON.parse(content);
        }
        current.language = language;
        await RNFS.writeFile(GLOBAL_SETTINGS_FILE, JSON.stringify(current), 'utf8');
    } catch (error) {
        console.error('Failed to save language preference:', error);
    }
};
