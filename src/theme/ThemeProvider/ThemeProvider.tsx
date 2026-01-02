import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { THEME as light } from '../light';
import { THEME as dark } from '../dark';
import { useColorScheme } from 'react-native';
import { ITheme } from '../../types/theme';

export type Variant = 'dark' | 'default';

export type ThemeState = {
    variant: Variant;
};

type Context = ITheme & {
    variant: Variant;
    isAuto: boolean;
    navigationTheme: NavigationTheme;
    setIsAuto: (isAuto: boolean) => void;
    changeTheme: (variant: Variant) => void;
};

export const ThemeContext = createContext<Context | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

function ThemeProvider({ children }: PropsWithChildren) {
    const schema = useColorScheme();

    const [variant, setVariant] = useState<Variant>('default');
    const [isAuto, setAuto] = useState<boolean>(false);

    useEffect(() => {
        if (isAuto) {
            setVariant(schema === 'light' ? 'default' : 'dark');
        }
    }, [isAuto, schema]);

    const setIsAuto = (nextSetting: boolean) => {
        setAuto(nextSetting);
    };

    const changeTheme = (nextVariant: Variant) => {
        setVariant(nextVariant);
    };

    const navigationTheme = useMemo(() => {
        return variant === 'default'
            ? {
                ...DefaultTheme,
                isDark: false,
                colors: {
                    ...DefaultTheme.colors,
                    border: 'rgba(0,0,0,0)',
                    text: String(light.colors.text),
                    card: String(light.colors.card),
                    primary: String(light.colors.primary),
                    notification: String(light.colors.primary),
                    background: String(light.colors.background),
                },
            }
            : {
                ...DarkTheme,
                isDark: true,
                colors: {
                    ...DarkTheme.colors,
                    border: 'rgba(0,0,0,0)',
                    text: String(dark.colors.text),
                    card: String(dark.colors.card),
                    primary: String(dark.colors.primary),
                    notification: String(dark.colors.primary),
                    background: String(dark.colors.background),
                },
            };
    }, [variant]);

    const value = useMemo(() => {
        return {
            ...(variant === 'default' ? light : dark),
            variant,
            navigationTheme,
            changeTheme,
            isAuto,
            setIsAuto,
        };
    }, [variant, navigationTheme, changeTheme, isAuto]);

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export default ThemeProvider;
