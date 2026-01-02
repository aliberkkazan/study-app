import { ITheme, ThemeColors, ThemeSizes, ThemeSpacing } from '@/types/theme';

import { StyleSheet } from 'react-native';
import { THEME as commonTheme } from './common';

export const SIZES: ThemeSizes = {
    // global sizes
    base: 8,
    text: 13,
    radius: 4,
    padding: 20,

    // font sizes
    h1: 44,
    h2: 40,
    h3: 32,
    h4: 24,
    h5: 18,
    p: 14,

    // button sizes
    buttonBorder: 1,
    buttonRadius: 8,
    iconSize: 32,

    // input sizes
    inputHeight: 48,
    inputBorder: StyleSheet.hairlineWidth,
    inputRadius: 12,
    inputPadding: 14,

    // card sizes
    cardRadius: 16,
    cardPadding: 10,

    // image sizes
    imageRadius: 14,
    avatarSize: 32,
    avatarRadius: 8,

    // switch sizes
    switchWidth: 50,
    switchHeight: 24,
    switchThumb: 20,

    // checkbox sizes
    checkboxWidth: 18,
    checkboxHeight: 18,
    checkboxRadius: 5,
    checkboxIconWidth: 20,
    checkboxIconHeight: 18,

    // product link size
    linkSize: 12,

    /** font size multiplier: for maxFontSizeMultiplier prop */
    multiplier: 2,
};

export const SPACING: ThemeSpacing = {
    /** xs: 4px */
    xs: SIZES.base * 0.5,
    /** s: 8px */
    s: SIZES.base * 1,
    /** sm: 16px */
    sm: SIZES.base * 2,
    /** m: 24px */
    m: SIZES.base * 3,
    /** md: 32px */
    md: SIZES.base * 4,
    /** l: 40px */
    l: SIZES.base * 5,
    /** xl: 48px */
    xl: SIZES.base * 6,
    /** xxl: 56px */
    xxl: SIZES.base * 7,
};
export const COLORS: ThemeColors = {
    // default text color
    text: '#252F40',

    // base colors
    /** UI color for #primary */
    primary: '#14346c',
    /** UI color for #secondary */
    secondary: '#627594', // '#8392AB',
    /** UI color for #tertiary */
    tertiary: '#E8AE4C',

    // non-colors
    black: '#252F40',
    white: '#FFFFFF',

    dark: '#252F40',
    light: '#E9ECEF',

    // gray variations
    /** UI color for #gray */
    gray: '#B9B7C7',

    // colors variations
    /** UI color for #danger */
    danger: '#ED553B',
    /** UI color for #warning */
    warning: '#F6D55C',
    /** UI color for #success */
    success: '#3CAEA3',
    /** UI color for #info */
    info: '#20639B',

    /** UI colors for navigation & card */
    card: '#d3d3d3ff',
    background: '#FFFFFF',

    /** UI color for shadowColor */
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.3)',

    /** UI color for input borderColor on focus */
    focus: '#4238EC',
    input: '#252F40',

    /** UI color for switch checked/active color */
    switchOn: '#3A416F',
    switchOff: '#E9ECEF',

    /** UI color for checkbox icon checked/active color */
    checkbox: ['#3A416F', '#141727'],
    checkboxIcon: '#4238EC',

    /** icon tint color */
    icon: '#20639B',

    /** blur tint color */
    blurTint: 'light',

    /** product link color */
    link: '#CB0C9F',

    button: '#14346c',
};

export const THEME: ITheme = {
    ...commonTheme,
    colors: COLORS,
    sizes: { ...SIZES, ...commonTheme.sizes, ...SPACING },
    isDark: false,
    spacing: SPACING,
    textVariants: {
        header: {
            fontSize: 24,
            fontWeight: 'bold',
        },
        body: {
            fontSize: 16,
        },
    },
};
