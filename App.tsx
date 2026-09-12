import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import RootNavigator from './src/navigators/RootNavigator';
import { ThemeProvider } from '@/theme';
import { cleanupLegacySessionFile } from './src/utils/secureStorage';

const App = () => {
    useEffect(() => {
        // Remove any legacy unencrypted session files on startup
        cleanupLegacySessionFile().catch(() => {});
    }, []);

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <RootNavigator />
                </ThemeProvider>
            </SafeAreaProvider>
        </Provider>
    );
};

export default App;
