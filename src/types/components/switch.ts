import { ColorValue, ViewStyle, Animated } from 'react-native';

import { ISpacing } from '../theme';

/**
 * ## Switch
 * Default usage:
 * ```
 * <Switch checked />
 * ```
 *
 */
export interface ISwitchProps extends ISpacing {
    /**
     * Switch checked value
     */
    checked?: boolean;
    /**
     * Renders the Switch component with custom style, overwrite existing/predefined styles
     * @see https://reactnative.dev/docs/view#style
     */
    style?: ViewStyle;
    /**
     * Renders the thumb color value
     */
    thumbColor?: ColorValue;
    /**
     * Renders the switch active thumb backgroundColor value
     */
    activeFillColor?: ColorValue;
    /**
     * Renders the switch inactive thumb backgroundColor value
     */
    inactiveFillColor?: ColorValue;
    /**
     * Renders the thumb style
     * @see https://reactnative.dev/docs/view#style
     */
    thumbStyle?: ViewStyle;
    /**
     * Renders the switch container style
     * @see https://reactnative.dev/docs/view#style
     */
    switchStyle?: ViewStyle;
    /**
     * Switch onPress callback passing the checked value as params
     */
    onPress?: (checked: boolean) => void;
    /**
     * Duration in ms for thumb animated position
     */
    duration?: Animated.TimingAnimationConfig['duration'];
}
