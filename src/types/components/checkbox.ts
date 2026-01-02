import { ViewStyle } from 'react-native';

import { ISpacing } from '../theme';

/**
 * ## Checkbox
 * Default usage:
 * ```
 * <Checkbox checked />
 * ```
 *
 */
export interface ICheckboxProps extends ISpacing {
    /**
     * Checkbox checked value
     */
    checked?: boolean;
    /**
     * Provides haptic feedback when toggling the checkbox
     * @see https://docs.expo.io/versions/latest/sdk/haptics/
     */
    haptic?: boolean;
    /**
     * Renders the Pressable container style
     * @see https://reactnative.dev/docs/view#style
     */
    style?: ViewStyle;
    /**
     * Checkbox onPress callback passing the checked value as params
     */
    onPress?: (checked: boolean) => void;
    /**
     * Checkbox onPress callback passing the checked value as params
     */
    label?: string;
}
