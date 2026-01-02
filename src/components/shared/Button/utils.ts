/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { StyleSheet } from 'react-native';
import color from 'color';

export type ButtonMode =
    | 'text'
    | 'outlined'
    | 'contained'
    | 'elevated'
    | 'contained-tonal';

type BaseProps = {
    isMode: (mode: ButtonMode) => boolean;
    theme: any;
    disabled?: boolean;
    backgroundColor: string;
};

const isDark = ({
    dark,
    backgroundColor,
}: {
    dark?: boolean;
    backgroundColor?: string;
}) => {
    if (backgroundColor === 'transparent') {
        return false;
    }

    if (backgroundColor !== 'transparent') {
        return !color(backgroundColor).isLight();
    }

    return false;
};

const getButtonBackgroundColor = ({
    isMode,
    theme,
    disabled,
    customButtonColor,
}: BaseProps & {
    customButtonColor?: string;
}) => {
    if (customButtonColor && !disabled) {
        return color(customButtonColor).alpha(0.12).rgb().string();
    }

    if (isMode('contained')) {
        if (disabled) {
            return color(theme?.colors?.primary).alpha(0.3).rgb().string();
        }

        return theme?.colors?.primary;
    }

    return 'transparent';
};

const getButtonTextColor = ({
    isMode,
    theme,
    variant,
    disabled,
    customTextColor,
    dark,
    backgroundColor,
}: BaseProps & {
    customTextColor?: string;
    dark?: boolean;
}) => {
    if (customTextColor && !disabled) {
        return customTextColor;
    }
    if (disabled) {
        return color(variant === 'dark' ? '#FFF' : '#000')
            .alpha(0.32)
            .rgb()
            .string();
    }

    if (isMode('contained')) {
        return isDark({ dark, backgroundColor }) ? '#FFF' : '#000';
    }

    return theme?.colors?.text;
};

const getButtonBorderColor = ({ isMode, theme }: BaseProps) => {
    if (isMode('outlined')) {
        return color(theme?.variant === 'dark' ? '#FFF' : '#000')
            .alpha(0.29)
            .rgb()
            .string();
    }

    return 'transparent';
};

const getButtonBorderWidth = ({ isMode }: Omit<BaseProps, 'disabled'>) => {
    if (isMode('outlined')) {
        return StyleSheet.hairlineWidth;
    }
    return 0;
};

export const getButtonColors = ({
    theme,
    mode,
    customButtonColor,
    customTextColor,
    disabled,
    dark = false,
}: {
    theme: any;
    mode: ButtonMode;
    customButtonColor?: string;
    customTextColor?: string;
    disabled?: boolean;
    dark?: boolean;
}) => {
    const isMode = (modeToCompare: ButtonMode) => {
        return mode === modeToCompare;
    };

    const backgroundColor = getButtonBackgroundColor({
        isMode,
        theme,
        disabled,
        customButtonColor,
    });

    const textColor = getButtonTextColor({
        isMode,
        theme,
        disabled,
        customTextColor,
        dark,
        backgroundColor,
    });

    const borderColor = getButtonBorderColor({ isMode, theme, disabled });

    const borderWidth = getButtonBorderWidth({ isMode, theme });

    return {
        backgroundColor,
        borderColor,
        textColor,
        borderWidth,
    };
};
