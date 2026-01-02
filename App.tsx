import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import RootNavigator from './src/navigators/RootNavigator';
import { ThemeProvider } from '@/theme';

const App = () => {
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
