import * as React from 'react';
import { ColorValue, FlexStyle, ScaledSize, TextStyle } from 'react-native';

export type $Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type $RemoveChildren<T extends React.ComponentType<any>> = $Omit<
    React.ComponentPropsWithoutRef<T>,
    'children'
>;

export type EllipsizeProp = 'head' | 'middle' | 'tail' | 'clip';

// Spacing types
export type ISpacing = Pick<
    FlexStyle,
    | 'margin'
    | 'marginVertical'
    | 'marginHorizontal'
    | 'marginLeft'
    | 'marginRight'
    | 'marginTop'
    | 'marginBottom'
    | 'padding'
    | 'paddingVertical'
    | 'paddingHorizontal'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'paddingBottom'
    | 'gap'
>;

export type TWeight =
    /** fontWeight: 400 */
    | 'normal'
    /** fontWeight: 100 */
    | 'thin'
    /** fontWeight: 200 */
    | 'extralight'
    /** fontWeight: 300 */
    | 'light'
    /** fontWeight: 500 */
    | 'medium'
    /** fontWeight: 600 */
    | 'semibold'
    /** fontWeight: 700 */
    | 'bold'
    /** fontWeight: 800 */
    | 'extrabold'
    /** fontWeight: 900 */
    | 'black';

export interface ITheme {
    isDark: boolean;
    colors: ThemeColors;
    sizes: ThemeSizes & ThemeSpacing & ICommonTheme['sizes'];
    fonts: ThemeFonts;
    weights: ThemeWeights;
    lines: ThemeLineHeights;
    spacing: ThemeSpacing;
    textVariants: {
        header: {
            fontSize: number;
            fontWeight: string;
        };
        body: {
            fontSize: number;
        };
    };
}
export interface ICommonTheme {
    fonts: ThemeFonts;
    weights: ThemeWeights;
    lines: ThemeLineHeights;
    sizes: {
        width: ScaledSize['width'];
        height: ScaledSize['height'];
    };
}

export interface IThemeProvider {
    children?: React.ReactNode;
    theme?: ITheme;
    setTheme?: (theme?: ITheme) => void;
}

export interface ThemeColors {
    text: ColorValue;
    primary: ColorValue;
    secondary: ColorValue;
    tertiary: ColorValue;
    black: ColorValue;
    white: ColorValue;
    light: ColorValue;
    dark: ColorValue;
    gray: ColorValue;
    danger: ColorValue;
    warning: ColorValue;
    success: ColorValue;
    info: ColorValue;
    card: ColorValue;
    background: ColorValue;
    shadow: ColorValue;
    overlay: ColorValue;
    focus: ColorValue;
    input: ColorValue;
    switchOn: ColorValue;
    switchOff: ColorValue;
    checkbox: string[];
    checkboxIcon: ColorValue;
    icon: ColorValue;
    blurTint: 'light' | 'dark' | 'default';
    link: ColorValue;
    button: ColorValue;
}

export interface ThemeSizes {
    base: number;
    text: number;
    radius: number;
    padding: number;

    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    p: number;

    buttonBorder: number;
    buttonRadius: number;
    iconSize: number;

    inputHeight: number;
    inputBorder: number;
    inputRadius: number;
    inputPadding: number;

    cardRadius: number;
    cardPadding: number;

    imageRadius: number;
    avatarSize: number;
    avatarRadius: number;

    switchWidth: number;
    switchHeight: number;
    switchThumb: number;

    checkboxWidth: number;
    checkboxHeight: number;
    checkboxRadius: number;
    checkboxIconWidth: number;
    checkboxIconHeight: number;

    linkSize: number;

    multiplier: number;
}

export interface ThemeSpacing {
    xs: number;
    s: number;
    sm: number;
    m: number;
    md: number;
    l: number;
    xl: number;
    xxl: number;
}

export interface ThemeWeights {
    text: TextStyle['fontWeight'];
    h1?: TextStyle['fontWeight'];
    h2?: TextStyle['fontWeight'];
    h3?: TextStyle['fontWeight'];
    h4?: TextStyle['fontWeight'];
    h5?: TextStyle['fontWeight'];
    p?: TextStyle['fontWeight'];

    thin: TextStyle['fontWeight'];
    extralight: TextStyle['fontWeight'];
    light: TextStyle['fontWeight'];
    normal: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold?: TextStyle['fontWeight'];
    bold?: TextStyle['fontWeight'];
    extrabold?: TextStyle['fontWeight'];
    black?: TextStyle['fontWeight'];
}

export interface ThemeFonts {
    text: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    p: string;
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    bold: string;
    semibold: string;
    extrabold: string;
    black: string;
}

export interface ThemeLineHeights {
    text: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    p: number;
}
