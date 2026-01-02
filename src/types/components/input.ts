import { ColorValue, TextInputProps, TextStyle, ViewStyle } from 'react-native';

import { ISpacing } from '../theme';

/**
 * ## Input
 * Default usage:
 * ```
 * <Input />
 * ```
 *
 */
export interface IInputProps extends TextInputProps, ISpacing {
    /**
     * Renders a custom borderColor & placeholderTextColor
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    color?: ColorValue;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.primary value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    primary?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.secondary value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    secondary?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.tertiary value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    tertiary?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.black value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    black?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.white value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    white?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.gray value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    gray?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.danger value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    danger?: boolean;
    /**
     * Renders a right side danger icon for invalid input value
     * Renders a borderColor & placeholderTextColor directly from the colors.warning value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    warning?: boolean;
    /**
     * Renders a borderColor & placeholderTextColor directly from the colors.success value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    success?: boolean;
    /**
     * Renders a right side success icon for valid input value
     * Renders a borderColor & placeholderTextColor directly from the colors.info value
     * @see https://reactnative.dev/docs/view-style-props#backgroundcolor
     */
    info?: boolean;
    /**
     * Renders a right side search icon
     */
    search?: boolean;
    /**
     * Renders a disabled / non-editable TextInput
     * @see https://reactnative.dev/docs/textinput#editable
     */
    disabled?: boolean;
    /**
     * Renders the label top text
     */
    label?: string;
    /**
     * Renders a left side icon image from the Theme assets
     */
    icon?: string;
    /**
     * Renders the TextInput content
     */
    children?: React.ReactNode;
    /**
     * Renders the TextInput/Input component with custom style, overwrite existing/predefined styles
     * @see https://reactnative.dev/docs/textinput#style
     */
    style?: TextStyle;
    left?: React.ReactNode;
    right?: React.ReactNode;
    helperMessage?: string;
    helperType?: 'info' | 'error';
    containerStyle?: ViewStyle;
    labelColor?: string;
}
