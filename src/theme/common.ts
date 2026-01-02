import { ThemeFonts, ThemeLineHeights, ThemeWeights } from '@/types/theme';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const WEIGHTS: ThemeWeights = {
    text: 'normal',
    h1: '700',
    h2: '700',
    h3: '700',
    h4: '700',
    h5: '500',
    p: 'normal',

    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
};

export const FONTS: ThemeFonts = {
    // based on font family
    text: 'System',
    h1: 'System',
    h2: 'System',
    h3: 'System',
    h4: 'System',
    h5: 'System',
    p: 'System',
    thin: 'System',
    extralight: 'System',
    light: 'System',
    normal: 'System',
    medium: 'System',
    bold: 'System',
    semibold: 'System',
    extrabold: 'System',
    black: 'System',
};

export const LINE_HEIGHTS: ThemeLineHeights = {
    // font lineHeight
    text: 22,
    h1: 60,
    h2: 55,
    h3: 43,
    h4: 33,
    h5: 24,
    p: 22,
};

export const THEME = {
    fonts: FONTS,
    weights: WEIGHTS,
    lines: LINE_HEIGHTS,
    sizes: { width, height },
};
