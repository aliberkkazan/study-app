/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react/require-default-props */
import React, { useMemo } from 'react';
import {
    ViewStyle,
    StyleSheet,
    StyleProp,
    GestureResponderEvent,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { $RemoveChildren } from '@/types';
import { useTheme } from '@/theme';
import TouchableHighlight from '../TouchableHighlight/TouchableHighlight';
import Icon, { IconSource } from '../Icon/Icon';
import { getIconButtonColor } from './utils';

type IconButtonMode = 'outlined' | 'contained';

export type Props = $RemoveChildren<typeof TouchableHighlight> & {
    icon: IconSource;
    mode?: IconButtonMode;
    iconColor?: string;
    containerColor?: string;
    selected?: boolean;
    size?: number;
    disabled?: boolean;
    accessibilityLabel?: string;
    buttonSize?: number;
    onPress?: (e: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    isText?: boolean;
    ref?: React.RefObject<TouchableWithoutFeedback>;
};

function IconButton({
    icon,
    iconColor: customIconColor,
    containerColor: customContainerColor,
    size = 24,
    accessibilityLabel,
    disabled,
    onPress,
    selected = false,
    mode,
    buttonSize: customButtonSize,
    style,
    isText = false,
    ...rest
}: Props) {
    const IconComponent = Icon;
    const theme = useTheme();

    const { iconColor, rippleColor, backgroundColor, borderColor } =
        getIconButtonColor({
            theme,
            disabled,
            selected,
            mode,
            customIconColor,
            customContainerColor,
        });

    const buttonSize = useMemo(() => customButtonSize || size * 1.5, [size]);

    const borderStyles = {
        borderWidth: 0,
        borderRadius: buttonSize,
        borderColor,
    };

    return (
        <View
            style={
                [
                    {
                        backgroundColor,
                        width: buttonSize,
                        height: buttonSize,
                    },
                    styles.container,
                    borderStyles,
                    disabled && styles.disabled,
                    style,
                ] as StyleProp<ViewStyle>
            }>
            <TouchableHighlight
                borderless
                onPress={onPress}
                rippleColor={rippleColor}
                accessibilityLabel={accessibilityLabel}
                style={styles.touchable}
                // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
                accessibilityTraits={
                    disabled ? ['button', 'disabled'] : 'button'
                }
                accessibilityComponentType="button"
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                {...rest}>
                <IconComponent
                    color={iconColor}
                    source={icon}
                    size={size}
                    isText={isText}
                />
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        margin: 6,
        elevation: 0,
    },
    touchable: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.32,
    },
});

export default IconButton;
