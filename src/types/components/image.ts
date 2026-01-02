import { ImageProps, ImageStyle, StyleProp } from 'react-native';
import { ISpacing } from '../theme';

/**
 * ## Image
 * Default usage:
 * ```
 * <Image source={...} />
 * ```
 *
 */
export interface IImageProps extends ImageProps, ISpacing {
    /**
     * Avatar sizing: borderRadius from Math.min(height, weight)
     * sets the width & height to Math.min(height, weight)
     */
    avatar?: boolean;
    /**
     * Generates a shadow style
     * @see https://reactnative.dev/docs/shadow-props
     */
    shadow?: boolean;
    /**
     * Renders an ImageBackground component
     * @see https://reactnative.dev/docs/imagebackground
     */
    background?: boolean;
    /**
     * Renders a predefined theme sizes.borderRadius & overflow: 'hidden'
     * @see https://reactnative.dev/docs/image-style-props#borderradius
     */
    rounded?: boolean;
    /**
     * Renders a custom borderRadius value
     * @see https://reactnative.dev/docs/image-style-props#borderradius
     */
    radius?: ImageStyle['borderRadius'];
    /**
     * Changes the color of all the non-transparent pixels to the tintColor.
     * @see https://reactnative.dev/docs/image-style-props#tintcolor
     */
    color?: ImageStyle['tintColor'];
    /**
     * Modify the appearance and position of your components using 2D or 3D transformations
     * @see https://reactnative.dev/docs/transforms#transform
     */
    transform?: ImageStyle['transform'];
    /**
     * Renders the Image component with custom style, overwrite existing/predefined styles
     * @see https://reactnative.dev/docs/image#style
     */
    style?: StyleProp<ImageStyle>;
    /** Renders the ImageBackground content */
    children?: React.ReactNode;
}
