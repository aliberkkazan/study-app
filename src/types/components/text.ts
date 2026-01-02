import { TextProps, TextStyle } from 'react-native';

import { ISpacing } from '../theme';
import { ThemeFonts } from '@/types/theme';

/**
 * ## Text
 * Default usage:
 * ```
 * <Text>...</Text>
 * ```
 *
 */
export interface ITextProps extends TextProps, ISpacing {
    /**
     * Renders a Text with predefined textAlign: center
     * @see https://reactnative.dev/docs/text-style-props#textalign
     */
    center?: boolean;
    /**
     * Renders LinearGradient component, colors
     * @see https://docs.expo.io/versions/latest/sdk/linear-gradient/#props
     */
    gradient?: string[];
    /**
     * Renders a Text color directly from the colors.primary value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    primary?: boolean;
    /**
     * Renders a Text color directly from the colors.secondary value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    secondary?: boolean;
    /**
     * Renders a Text color directly from the colors.tertiary value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    tertiary?: boolean;
    /**
     * Renders a Text color directly from the colors.black value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    black?: boolean;
    /**
     * Renders a Text color directly from the colors.white value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    white?: boolean;
    /**
     * Renders a Text color directly from the colors.gray value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    gray?: boolean;
    /**
     * Renders a Text color directly from the colors.danger value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    danger?: boolean;
    /**
     * Renders a Text color directly from the colors.warning value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    warning?: boolean;
    /**
     * Renders a Text color directly from the colors.success value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    success?: boolean;
    /**
     * Renders a Text color directly from the colors.info value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    info?: boolean;
    /**
     * Renders a Text custom color value
     * @see https://reactnative.dev/docs/text-style-props#color
     */
    color?: TextStyle['color'];
    /**
     * Renders a Text with custom opacity value
     * @see https://reactnative.dev/docs/view-style-props#opacity
     */
    opacity?: TextStyle['opacity'];
    /**
     * Renders a Text with custom fontSize
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    size?: string | number;
    /**
     * Renders a Text with custom fontWeight
     * @see https://reactnative.dev/docs/text-style-props#fontweight
     */
    weight?: keyof ThemeFonts;
    /**
     * Renders a Text with custom fontFamily
     * @see https://reactnative.dev/docs/text-style-props#fontfamily
     */
    font?: string;
    /**
     * Renders a Text with predefined fontFamily from theme fonts.bold
     * @see https://reactnative.dev/docs/text-style-props#fontfamily
     */
    bold?: boolean;
    /**
     * Renders a Text with predefined fontFamily from theme fonts.semibold
     * @see https://reactnative.dev/docs/text-style-props#fontfamily
     */
    semibold?: boolean;
    /**
     * Renders a Text with predefined fontFamily from theme
     */
    family?: keyof ThemeFonts;
    /**
     * Renders a Text with predefined fontSize from theme sizes.h1
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    h1?: boolean;
    /**
     * Renders a Text with predefined fontSize from theme sizes.h2
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    h2?: boolean;
    /**
     * Renders a Text with predefined fontSize from theme sizes.h3
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    h3?: boolean;
    /**
     * Renders a Text with predefined fontSize from theme sizes.h4
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    h4?: boolean;
    /**
     * Renders a Text with predefined fontSize from theme sizes.h5
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    h5?: boolean;
    /**
     * Renders a Text with predefined fontSize from theme sizes.p
     * @see https://reactnative.dev/docs/text-style-props#fontsize
     */
    p?: boolean;
    /**
     * Renders a Text with custom textAlign
     * @see https://reactnative.dev/docs/text-style-props#textalign
     */
    align?: TextStyle['textAlign'];
    /**
     * Renders a Text with custom textTransform: 'none', 'uppercase', 'lowercase', 'capitalize'
     * @see https://reactnative.dev/docs/text-style-props#texttransform
     */
    transform?: TextStyle['textTransform'];
    /**
     * Renders a Text with custom lineHeight
     * @see https://reactnative.dev/docs/text-style-props#lineheight
     */
    lineHeight?: TextStyle['lineHeight'];
    /**
     * Renders text right offset
     * @see https://reactnative.dev/docs/layout-props#right
     */
    right?: TextStyle['right'];
    /**
     * Renders the View left offset
     * @see https://reactnative.dev/docs/layout-props#left
     */
    left?: TextStyle['left'];
    /**
     * Renders the View top offset
     * @see https://reactnative.dev/docs/layout-props#top
     */
    top?: TextStyle['top'];
    /**
     * Renders the View bottom offset
     * @see https://reactnative.dev/docs/layout-props#bottom
     */
    bottom?: TextStyle['bottom'];
    /**
     * Renders text position
     * @see https://reactnative.dev/docs/layout-props#position
     */
    position?: TextStyle['position'];
    /**
     * Renders a Text component to display text
     * Supports nesting, styling, and touch handling.
     * @see https://reactnative.dev/docs/text
     */
    children?: React.ReactNode;
    /**
     * Renders the Text component with custom style, overwrite existing/predefined styles
     * @see https://reactnative.dev/docs/text#style
     */
    style?: TextStyle;
}
